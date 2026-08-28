from sqlalchemy import Column, String, Float, DateTime, Integer, Text, Boolean, ForeignKey, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()


class TransactionDB(Base):
    __tablename__ = "transactions"
    
    id = Column(String, primary_key=True)
    customer_id = Column(String, index=True)
    merchant_id = Column(String, index=True)
    issuer = Column(String, index=True)
    amount = Column(Float)
    payment_method = Column(String)
    status = Column(String, index=True)
    error_code = Column(String, nullable=True, index=True)
    timestamp = Column(DateTime, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    logs = relationship("LogDB", back_populates="transaction", cascade="all, delete-orphan")


class LogDB(Base):
    __tablename__ = "logs"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, index=True)
    level = Column(String, index=True)
    message = Column(Text)
    payment_id = Column(String, ForeignKey("transactions.id"), nullable=True, index=True)
    service = Column(String, index=True)
    metadata = Column(Text, nullable=True)  # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    transaction = relationship("TransactionDB", back_populates="logs")


class MetricDB(Base):
    __tablename__ = "metrics"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, index=True)
    issuer = Column(String, index=True)
    latency_ms = Column(Float)
    success_rate = Column(Float)
    timeout_rate = Column(Float)
    failure_rate = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        Index('idx_metrics_issuer_timestamp', 'issuer', 'timestamp'),
    )


class IncidentDB(Base):
    __tablename__ = "incidents"
    
    id = Column(String, primary_key=True)
    issuer = Column(String, index=True)
    issue = Column(String)
    severity = Column(String, index=True)
    status = Column(String, index=True)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
    root_cause = Column(Text, nullable=True)
    resolution = Column(Text, nullable=True)


class InvestigationDB(Base):
    __tablename__ = "investigations"
    
    id = Column(String, primary_key=True)
    payment_id = Column(String, nullable=True, index=True)
    incident_id = Column(String, nullable=True, index=True)
    customer_query = Column(Text, nullable=True)
    investigation_type = Column(String, index=True)
    
    root_cause = Column(Text, nullable=True)
    confidence = Column(Float)
    confidence_level = Column(String, index=True)
    
    recommendation = Column(Text, nullable=True)
    requires_human_review = Column(Boolean, default=False, index=True)
    
    customer_explanation = Column(Text, nullable=True)
    internal_explanation = Column(Text, nullable=True)
    
    status = Column(String, index=True)
    error_message = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Store full state as JSON
    state_json = Column(Text, nullable=True)