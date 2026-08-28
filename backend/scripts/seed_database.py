#!/usr/bin/env python3
"""
Script to seed the database with synthetic data
"""
import sys
import os
import json

# Add the parent directory to the path so we can import from app
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.connection import SessionLocal, init_db
from app.models.database import TransactionDB, LogDB, MetricDB, IncidentDB
from datetime import datetime


def load_synthetic_data():
    """Load synthetic data from JSON files"""
    data_dir = "./data/synthetic"
    
    data = {}
    for file_type in ["transactions", "logs", "metrics", "incidents"]:
        file_path = os.path.join(data_dir, f"{file_type}.json")
        if os.path.exists(file_path):
            with open(file_path, 'r') as f:
                data[file_type] = json.load(f)
        else:
            print(f"Warning: {file_path} not found")
            data[file_type] = []
    
    return data


def seed_database():
    """Seed the database with synthetic data"""
    print("Seeding database with synthetic data...")
    
    # Initialize database
    init_db()
    
    # Create database session
    db = SessionLocal()
    
    try:
        # Load synthetic data
        data = load_synthetic_data()
        
        # Seed transactions
        if "transactions" in data:
            print(f"Seeding {len(data['transactions'])} transactions...")
            for tx_data in data["transactions"]:
                # Convert timestamp string to datetime
                if isinstance(tx_data["timestamp"], str):
                    tx_data["timestamp"] = datetime.fromisoformat(tx_data["timestamp"].replace('Z', '+00:00'))
                
                transaction = TransactionDB(**tx_data)
                db.add(transaction)
            
            db.commit()
            print("✅ Transactions seeded successfully")
        
        # Seed logs
        if "logs" in data:
            print(f"Seeding {len(data['logs'])} log entries...")
            for log_data in data["logs"]:
                # Convert timestamp string to datetime
                if isinstance(log_data["timestamp"], str):
                    log_data["timestamp"] = datetime.fromisoformat(log_data["timestamp"].replace('Z', '+00:00'))
                
                # Convert metadata dict to JSON string
                if isinstance(log_data.get("metadata"), dict):
                    import json
                    log_data["metadata"] = json.dumps(log_data["metadata"])
                
                log = LogDB(**log_data)
                db.add(log)
            
            db.commit()
            print("✅ Logs seeded successfully")
        
        # Seed metrics
        if "metrics" in data:
            print(f"Seeding {len(data['metrics'])} metric entries...")
            for metric_data in data["metrics"]:
                # Convert timestamp string to datetime
                if isinstance(metric_data["timestamp"], str):
                    metric_data["timestamp"] = datetime.fromisoformat(metric_data["timestamp"].replace('Z', '+00:00'))
                
                metric = MetricDB(**metric_data)
                db.add(metric)
            
            db.commit()
            print("✅ Metrics seeded successfully")
        
        # Seed incidents
        if "incidents" in data:
            print(f"Seeding {len(data['incidents'])} incidents...")
            for incident_data in data["incidents"]:
                # Convert timestamp strings to datetime
                if isinstance(incident_data["created_at"], str):
                    incident_data["created_at"] = datetime.fromisoformat(incident_data["created_at"].replace('Z', '+00:00'))
                if isinstance(incident_data["updated_at"], str):
                    incident_data["updated_at"] = datetime.fromisoformat(incident_data["updated_at"].replace('Z', '+00:00'))
                
                incident = IncidentDB(**incident_data)
                db.add(incident)
            
            db.commit()
            print("✅ Incidents seeded successfully")
        
        print("✅ Database seeding completed successfully")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()