-- PayLens Database Schema
-- PostgreSQL Schema for Payment AIOps Platform

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For text search
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- For index optimization

-- ============================================
-- PAYMENT TRANSACTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id VARCHAR(50) UNIQUE NOT NULL,
    customer_id VARCHAR(50) NOT NULL,
    merchant_id VARCHAR(50) NOT NULL,
    issuer VARCHAR(100) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    payment_method VARCHAR(50) NOT NULL, -- UPI, Credit Card, Debit Card, etc.
    status VARCHAR(20) NOT NULL, -- success, failed, timeout, pending
    error_code VARCHAR(20),
    error_message TEXT,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for common queries
    INDEX idx_payment_id (payment_id),
    INDEX idx_customer_id (customer_id),
    INDEX idx_issuer (issuer),
    INDEX idx_status (status),
    INDEX idx_error_code (error_code),
    INDEX idx_timestamp (timestamp),
    INDEX idx_issuer_timestamp (issuer, timestamp)
);

-- ============================================
-- PAYMENT LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS payment_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id VARCHAR(50),
    log_level VARCHAR(20) NOT NULL, -- INFO, WARNING, ERROR, DEBUG
    message TEXT NOT NULL,
    service VARCHAR(100) NOT NULL, -- payment-gateway, issuer-service, fraud-service, etc.
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key to transactions (optional, logs can exist without transactions)
    CONSTRAINT fk_payment_logs_payment 
        FOREIGN KEY (payment_id) 
        REFERENCES payment_transactions(payment_id) 
        ON DELETE SET NULL,
    
    -- Indexes for log analysis
    INDEX idx_payment_id (payment_id),
    INDEX idx_log_level (log_level),
    INDEX idx_service (service),
    INDEX idx_timestamp (timestamp),
    INDEX idx_log_level_timestamp (log_level, timestamp),
    
    -- Full-text search on messages
    INDEX idx_message_search ON payment_logs USING gin(to_tsvector('english', message))
);

-- ============================================
-- PAYMENT METRICS
-- ============================================
CREATE TABLE IF NOT EXISTS payment_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issuer VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    latency_ms DECIMAL(10,2) NOT NULL,
    success_rate DECIMAL(5,4) NOT NULL, -- 0.0000 to 1.0000
    timeout_rate DECIMAL(5,4) NOT NULL,
    failure_rate DECIMAL(5,4) NOT NULL,
    transaction_count INTEGER NOT NULL,
    total_amount DECIMAL(20,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for metric analysis
    INDEX idx_issuer (issuer),
    INDEX idx_timestamp (timestamp),
    INDEX idx_issuer_timestamp (issuer, timestamp),
    
    -- Unique constraint to prevent duplicate metrics
    UNIQUE(issuer, timestamp)
);

-- ============================================
-- INCIDENTS
-- ============================================
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id VARCHAR(50) UNIQUE NOT NULL,
    issuer VARCHAR(100) NOT NULL,
    issue VARCHAR(255) NOT NULL,
    severity VARCHAR(20) NOT NULL, -- LOW, MEDIUM, HIGH, CRITICAL
    status VARCHAR(20) NOT NULL, -- detected, investigating, resolved, monitoring
    description TEXT,
    root_cause TEXT,
    affected_transactions INTEGER DEFAULT 0,
    detected_at TIMESTAMP WITH TIME ZONE NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for incident management
    INDEX idx_incident_id (incident_id),
    INDEX idx_issuer (issuer),
    INDEX idx_severity (severity),
    INDEX idx_status (status),
    INDEX idx_detected_at (detected_at),
    INDEX idx_status_severity (status, severity)
);

-- ============================================
-- INVESTIGATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS investigations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    investigation_id VARCHAR(50) UNIQUE NOT NULL,
    investigation_type VARCHAR(20) NOT NULL, -- payment, incident, support
    payment_id VARCHAR(50),
    incident_id VARCHAR(50),
    customer_query TEXT,
    
    -- Investigation results
    root_cause_category VARCHAR(20),
    root_cause_description TEXT,
    confidence DECIMAL(5,4),
    confidence_level VARCHAR(20), -- HIGH, MEDIUM, LOW
    
    -- Resolution
    recommended_action TEXT,
    priority VARCHAR(20),
    requires_human_review BOOLEAN DEFAULT FALSE,
    human_review_status VARCHAR(20), -- pending, completed, skipped
    
    -- Communication
    customer_explanation TEXT,
    internal_explanation TEXT,
    
    -- Metadata
    status VARCHAR(20) NOT NULL, -- initialized, triaged, evidence_collected, root_cause_identified, recommendation_generated, completed, failed
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Foreign keys
    CONSTRAINT fk_investigations_payment 
        FOREIGN KEY (payment_id) 
        REFERENCES payment_transactions(payment_id) 
        ON DELETE SET NULL,
    CONSTRAINT fk_investigations_incident 
        FOREIGN KEY (incident_id) 
        REFERENCES incidents(incident_id) 
        ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_investigation_id (investigation_id),
    INDEX idx_investigation_type (investigation_type),
    INDEX idx_payment_id (payment_id),
    INDEX idx_incident_id (incident_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_confidence (confidence)
);

-- ============================================
-- EVIDENCE COLLECTION
-- ============================================
CREATE TABLE IF NOT EXISTS investigation_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    investigation_id VARCHAR(50) NOT NULL,
    evidence_type VARCHAR(50) NOT NULL, -- transaction, logs, metrics, incidents, runbooks
    evidence_data JSONB NOT NULL,
    relevance_score DECIMAL(5,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key
    CONSTRAINT fk_evidence_investigation 
        FOREIGN KEY (investigation_id) 
        REFERENCES investigations(investigation_id) 
        ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_investigation_id (investigation_id),
    INDEX idx_evidence_type (evidence_type),
    INDEX idx_relevance_score (relevance_score)
);

-- ============================================
-- RUNBOOKS
-- ============================================
CREATE TABLE IF NOT EXISTS runbooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- Issuer Timeout, Fraud Decline, Network Failure, etc.
    content TEXT NOT NULL,
    tags TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_category (category),
    INDEX idx_is_active (is_active),
    INDEX idx_tags (tags),
    
    -- Full-text search
    INDEX idx_runbook_search ON runbooks USING gin(to_tsvector('english', title || ' ' || content))
);

-- ============================================
-- ANOMALY DETECTION RESULTS
-- ============================================
CREATE TABLE IF NOT EXISTS anomaly_detections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issuer VARCHAR(100) NOT NULL,
    anomaly_type VARCHAR(50) NOT NULL, -- isolation_forest, statistical, time_series
    metric_name VARCHAR(50), -- latency_ms, timeout_rate, etc.
    anomaly_score DECIMAL(10,4) NOT NULL,
    severity VARCHAR(20) NOT NULL, -- low, medium, high, critical
    metric_value DECIMAL(15,4),
    threshold_value DECIMAL(15,4),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    additional_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_issuer (issuer),
    INDEX idx_anomaly_type (anomaly_type),
    INDEX idx_severity (severity),
    INDEX idx_timestamp (timestamp),
    INDEX idx_issuer_timestamp (issuer, timestamp),
    INDEX idx_severity_timestamp (severity, timestamp)
);

-- ============================================
-- ML MODELS
-- ============================================
CREATE TABLE IF NOT EXISTS ml_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_name VARCHAR(100) NOT NULL,
    model_type VARCHAR(50) NOT NULL, -- isolation_forest, dbscan, etc.
    version VARCHAR(20) NOT NULL,
    model_path TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    training_data_size INTEGER,
    training_metrics JSONB,
    trained_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_model_name (model_name),
    INDEX idx_model_type (model_type),
    INDEX idx_is_active (is_active)
);

-- ============================================
-- SYSTEM HEALTH METRICS
-- ============================================
CREATE TABLE IF NOT EXISTS system_health (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL, -- healthy, degraded, down
    response_time_ms DECIMAL(10,2),
    error_rate DECIMAL(5,4),
    uptime_percentage DECIMAL(5,4),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_service_name (service_name),
    INDEX idx_status (status),
    INDEX idx_timestamp (timestamp),
    INDEX idx_service_timestamp (service_name, timestamp)
);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_payment_transactions_updated_at BEFORE UPDATE ON payment_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON incidents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investigations_updated_at BEFORE UPDATE ON investigations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_runbooks_updated_at BEFORE UPDATE ON runbooks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- View for recent payment failures
CREATE OR REPLACE VIEW recent_payment_failures AS
SELECT 
    pt.payment_id,
    pt.customer_id,
    pt.issuer,
    pt.amount,
    pt.error_code,
    pt.timestamp,
    COUNT(pl.id) as log_count
FROM payment_transactions pt
LEFT JOIN payment_logs pl ON pt.payment_id = pl.payment_id
WHERE pt.status = 'failed'
AND pt.timestamp > NOW() - INTERVAL '24 hours'
GROUP BY pt.payment_id, pt.customer_id, pt.issuer, pt.amount, pt.error_code, pt.timestamp
ORDER BY pt.timestamp DESC;

-- View for issuer performance metrics
CREATE OR REPLACE VIEW issuer_performance AS
SELECT 
    issuer,
    AVG(latency_ms) as avg_latency,
    AVG(success_rate) as avg_success_rate,
    AVG(timeout_rate) as avg_timeout_rate,
    AVG(failure_rate) as avg_failure_rate,
    SUM(transaction_count) as total_transactions,
    COUNT(*) as metric_samples
FROM payment_metrics
WHERE timestamp > NOW() - INTERVAL '24 hours'
GROUP BY issuer
ORDER BY avg_success_rate DESC;

-- View for active incidents
CREATE OR REPLACE VIEW active_incidents AS
SELECT 
    incident_id,
    issuer,
    issue,
    severity,
    status,
    detected_at,
    EXTRACT(EPOCH FROM (NOW() - detected_at))/3600 as hours_since_detection
FROM incidents
WHERE status IN ('detected', 'investigating')
ORDER BY 
    CASE severity 
        WHEN 'CRITICAL' THEN 1 
        WHEN 'HIGH' THEN 2 
        WHEN 'MEDIUM' THEN 3 
        WHEN 'LOW' THEN 4 
    END,
    detected_at DESC;

-- ============================================
-- SAMPLE DATA INSERTION (OPTIONAL)
-- ============================================

-- Insert sample runbooks
INSERT INTO runbooks (title, category, content, tags) VALUES
('Issuer Timeout Handling', 'Issuer Timeout', '## Issuer Timeout Handling

### Symptoms
- Payment requests timing out
- Elevated timeout rates (>10%)
- High latency from specific issuers

### Investigation Steps
1. Check issuer status page
2. Review network connectivity
3. Analyze timeout patterns
4. Check for rate limiting

### Resolution
- Implement retry with exponential backoff
- Route traffic to alternative issuers
- Monitor timeout rates
- Escalate to issuer support if needed', ARRAY['timeout', 'issuer', 'retry']),
('Fraud Detection Analysis', 'Fraud Decline', '## Fraud Detection Analysis

### Symptoms
- Transactions declined by fraud system
- Error code E1001
- Customer complaints about legitimate declines

### Investigation Steps
1. Review fraud rule triggers
2. Analyze customer behavior patterns
3. Check for false positives
4. Review transaction amounts and patterns

### Resolution
- Adjust fraud thresholds if needed
- Request additional verification
- Whitelist legitimate customers
- Update fraud risk profiles', ARRAY['fraud', 'decline', 'verification']),
('Network Failure Recovery', 'Network Failure', '## Network Failure Recovery

### Symptoms
- Connection errors
- Network timeouts
- DNS resolution failures

### Investigation Steps
1. Check network connectivity
2. Review DNS configuration
3. Analyze network logs
4. Check firewall rules

### Resolution
- Switch to backup network paths
- Implement circuit breakers
- Monitor network stability
- Contact network team if needed', ARRAY['network', 'connectivity', 'backup'])
ON CONFLICT DO NOTHING;

-- ============================================
-- GRANTS AND PERMISSIONS
-- ============================================

-- Create application user (adjust password as needed)
-- CREATE USER paylens_app WITH PASSWORD 'secure_password_here';
-- GRANT CONNECT ON DATABASE paylens TO paylens_app;
-- GRANT USAGE ON SCHEMA public TO paylens_app;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO paylens_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO paylens_app;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO paylens_app;

-- ============================================
-- MAINTENANCE NOTES
-- ============================================

-- Regular maintenance queries:
-- 1. Vacuum analyze tables: VACUUM ANALYZE payment_transactions;
-- 2. Reindex: REINDEX TABLE payment_transactions;
-- 3. Check table sizes: SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) FROM pg_tables WHERE schemaname = 'public';
-- 4. Monitor connections: SELECT count(*) FROM pg_stat_activity;