import random
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any
from faker import Faker
from app.models.state import Transaction, LogEntry, Metric, Incident, RootCauseCategory
import logging

logger = logging.getLogger(__name__)
fake = Faker()

# Constants
ISSUERS = ["HDFC", "ICICI", "SBI", "Axis", "Kotak", "Yes Bank", "PNB"]
PAYMENT_METHODS = ["UPI", "Credit Card", "Debit Card", "Net Banking", "Wallet"]
STATUSES = ["success", "failed", "pending", "timeout"]
ERROR_CODES = {
    "E1001": "Fraud Decline",
    "E2012": "Issuer Timeout", 
    "E3011": "Network Failure",
    "E4015": "Duplicate Payment",
    "E5003": "Bank Unavailable"
}
LOG_LEVELS = ["INFO", "WARNING", "ERROR", "DEBUG"]
SERVICES = ["payment-gateway", "fraud-service", "issuer-service", "notification-service", "ledger-service"]
SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
INCIDENT_STATUSES = ["investigating", "resolved", "monitoring", "escalated"]


class SyntheticDataGenerator:
    """Generate synthetic payment infrastructure data"""
    
    def __init__(self, num_transactions: int = 10000):
        self.num_transactions = num_transactions
        self.transactions: List[Transaction] = []
        self.logs: List[LogEntry] = []
        self.metrics: List[Metric] = []
        self.incidents: List[Incident] = []
    
    def generate_transactions(self) -> List[Transaction]:
        """Generate realistic payment transactions"""
        logger.info(f"Generating {self.num_transactions} transactions...")
        
        for i in range(self.num_transactions):
            payment_id = f"PAY_{10000 + i}"
            customer_id = f"CUST_{random.randint(1000, 9999)}"
            merchant_id = f"MERC_{random.randint(100, 999)}"
            issuer = random.choice(ISSUERS)
            amount = round(random.uniform(10, 10000), 2)
            payment_method = random.choice(PAYMENT_METHODS)
            
            # Weight status towards success (70% success rate)
            status = random.choices(
                STATUSES, 
                weights=[0.7, 0.2, 0.05, 0.05], 
                k=1
            )[0]
            
            error_code = None
            if status == "failed":
                error_code = random.choice(list(ERROR_CODES.keys()))
            
            # Generate timestamp within last 30 days
            timestamp = datetime.utcnow() - timedelta(
                days=random.randint(0, 30),
                hours=random.randint(0, 23),
                minutes=random.randint(0, 59)
            )
            
            transaction = Transaction(
                payment_id=payment_id,
                customer_id=customer_id,
                merchant_id=merchant_id,
                issuer=issuer,
                amount=amount,
                payment_method=payment_method,
                status=status,
                error_code=error_code,
                timestamp=timestamp
            )
            
            self.transactions.append(transaction)
        
        logger.info(f"Generated {len(self.transactions)} transactions")
        return self.transactions
    
    def generate_logs(self, logs_per_transaction: int = 5) -> List[LogEntry]:
        """Generate payment logs correlated with transactions"""
        logger.info(f"Generating logs for transactions...")
        
        log_messages = {
            "INFO": [
                "Payment initiated",
                "Request sent to issuer",
                "Payment processed successfully",
                "Customer notified",
                "Transaction recorded in ledger"
            ],
            "WARNING": [
                "Retry attempt initiated",
                "High latency detected",
                "Rate limit approaching",
                "Partial response received"
            ],
            "ERROR": [
                "Issuer timeout",
                "Payment failed",
                "Network connection failed",
                "Invalid response from issuer",
                "Fraud check triggered"
            ],
            "DEBUG": [
                "Processing payment request",
                "Validating customer details",
                "Checking fraud rules",
                "Calculating fees"
            ]
        }
        
        for transaction in self.transactions:
            for _ in range(random.randint(1, logs_per_transaction)):
                level = random.choice(LOG_LEVELS)
                
                # Correlate log level with transaction status
                if transaction.status == "success":
                    level = random.choices(LOG_LEVELS, weights=[0.6, 0.2, 0.05, 0.15], k=1)[0]
                elif transaction.status == "failed":
                    level = random.choices(LOG_LEVELS, weights=[0.2, 0.3, 0.4, 0.1], k=1)[0]
                
                message = random.choice(log_messages[level])
                service = random.choice(SERVICES)
                
                # Log timestamp should be close to transaction timestamp
                timestamp = transaction.timestamp + timedelta(
                    seconds=random.randint(-5, 30)
                )
                
                metadata = {
                    "request_id": fake.uuid4(),
                    "duration_ms": random.randint(50, 5000)
                }
                
                log = LogEntry(
                    timestamp=timestamp,
                    level=level,
                    message=message,
                    payment_id=transaction.payment_id,
                    service=service,
                    metadata=metadata
                )
                
                self.logs.append(log)
        
        logger.info(f"Generated {len(self.logs)} log entries")
        return self.logs
    
    def generate_metrics(self, hours: int = 720) -> List[Metric]:
        """Generate time-series metrics for issuers"""
        logger.info(f"Generating metrics for {hours} hours...")
        
        # Generate metrics for each issuer every hour
        for issuer in ISSUERS:
            for hour in range(hours):
                timestamp = datetime.utcnow() - timedelta(hours=hour)
                
                # Simulate realistic metrics with occasional anomalies
                base_latency = random.uniform(100, 500)
                base_success_rate = random.uniform(0.95, 0.99)
                base_timeout_rate = random.uniform(0.01, 0.05)
                base_failure_rate = 1 - base_success_rate
                
                # Introduce occasional anomalies (5% chance)
                if random.random() < 0.05:
                    base_latency *= random.uniform(2, 5)
                    base_success_rate *= random.uniform(0.5, 0.8)
                    base_timeout_rate *= random.uniform(2, 4)
                    base_failure_rate = 1 - base_success_rate
                
                metric = Metric(
                    timestamp=timestamp,
                    issuer=issuer,
                    latency_ms=round(base_latency, 2),
                    success_rate=round(base_success_rate, 4),
                    timeout_rate=round(base_timeout_rate, 4),
                    failure_rate=round(base_failure_rate, 4)
                )
                
                self.metrics.append(metric)
        
        logger.info(f"Generated {len(self.metrics)} metric entries")
        return self.metrics
    
    def generate_incidents(self, num_incidents: int = 50) -> List[Incident]:
        """Generate historical incidents"""
        logger.info(f"Generating {num_incidents} incidents...")
        
        incident_templates = [
            "Elevated timeout rate",
            "Payment processing degradation",
            "Bank service unavailable",
            "High failure rate",
            "Network connectivity issues",
            "Fraud detection system overload",
            "API rate limiting triggered",
            "Database connection issues"
        ]
        
        for i in range(num_incidents):
            incident_id = f"INC{100 + i}"
            issuer = random.choice(ISSUERS)
            issue = random.choice(incident_templates)
            severity = random.choices(SEVERITIES, weights=[0.3, 0.4, 0.25, 0.05], k=1)[0]
            status = random.choices(INCIDENT_STATUSES, weights=[0.2, 0.5, 0.2, 0.1], k=1)[0]
            
            created_at = datetime.utcnow() - timedelta(
                days=random.randint(1, 90),
                hours=random.randint(0, 23)
            )
            
            updated_at = created_at + timedelta(
                hours=random.randint(1, 72)
            )
            
            description = f"{issue} detected for {issuer}. Investigation in progress."
            
            incident = Incident(
                incident_id=incident_id,
                issuer=issuer,
                issue=issue,
                severity=severity,
                status=status,
                created_at=created_at,
                updated_at=updated_at,
                description=description
            )
            
            self.incidents.append(incident)
        
        logger.info(f"Generated {len(self.incidents)} incidents")
        return self.incidents
    
    def generate_all(self) -> Dict[str, Any]:
        """Generate all synthetic data"""
        logger.info("Starting synthetic data generation...")
        
        self.generate_transactions()
        self.generate_logs()
        self.generate_metrics()
        self.generate_incidents()
        
        return {
            "transactions": self.transactions,
            "logs": self.logs,
            "metrics": self.metrics,
            "incidents": self.incidents
        }
    
    def save_to_json(self, output_dir: str = "./data/synthetic"):
        """Save generated data to JSON files"""
        import os
        os.makedirs(output_dir, exist_ok=True)
        
        logger.info(f"Saving synthetic data to {output_dir}...")
        
        def to_dict(obj):
            if hasattr(obj, 'dict'):
                return obj.dict()
            elif isinstance(obj, datetime):
                return obj.isoformat()
            elif isinstance(obj, list):
                return [to_dict(item) for item in obj]
            return obj
        
        data = {
            "transactions": [t.dict() for t in self.transactions],
            "logs": [l.dict() for l in self.logs],
            "metrics": [m.dict() for m in self.metrics],
            "incidents": [i.dict() for i in self.incidents]
        }
        
        for key, value in data.items():
            filepath = os.path.join(output_dir, f"{key}.json")
            with open(filepath, 'w') as f:
                json.dump(value, f, indent=2, default=str)
            logger.info(f"Saved {len(value)} {key} to {filepath}")
        
        logger.info("Synthetic data saved successfully")


if __name__ == "__main__":
    generator = SyntheticDataGenerator(num_transactions=10000)
    generator.generate_all()
    generator.save_to_json()