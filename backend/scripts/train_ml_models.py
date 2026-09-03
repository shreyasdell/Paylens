#!/usr/bin/env python3
"""
Script to train ML models for anomaly detection
"""
import sys
import os
import asyncio
from datetime import datetime, timedelta
import random
import numpy as np

# Add the parent directory to the path so we can import from app
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.ml_service import ml_anomaly_detector
from app.services.synthetic_data import SyntheticDataGenerator


def generate_synthetic_training_data(days=30):
    """Generate synthetic training data for ML models"""
    print(f"Generating {days} days of synthetic training data...")
    
    generator = SyntheticDataGenerator()
    training_data = []
    
    # Generate data for multiple issuers
    issuers = ["HDFC", "ICICI", "SBI", "Axis", "Kotak"]
    
    for day in range(days):
        date = datetime.utcnow() - timedelta(days=day)
        
        for issuer in issuers:
            # Generate hourly metrics for each issuer
            for hour in range(24):
                timestamp = date.replace(hour=hour, minute=0, second=0)
                
                # Generate normal metrics with occasional anomalies
                is_anomaly = random.random() < 0.05  # 5% anomaly rate
                
                if is_anomaly:
                    # Generate anomalous data
                    metrics = {
                        'timestamp': timestamp.isoformat(),
                        'issuer': issuer,
                        'latency_ms': random.uniform(800, 2000),  # High latency
                        'success_rate': random.uniform(0.70, 0.85),  # Low success rate
                        'timeout_rate': random.uniform(0.10, 0.25),  # High timeout rate
                        'failure_rate': random.uniform(0.08, 0.20),  # High failure rate
                        'transaction_count': random.randint(50, 200),
                        'transaction_amount': random.uniform(10000, 50000)
                    }
                else:
                    # Generate normal data
                    metrics = {
                        'timestamp': timestamp.isoformat(),
                        'issuer': issuer,
                        'latency_ms': random.uniform(100, 400),  # Normal latency
                        'success_rate': random.uniform(0.92, 0.99),  # Normal success rate
                        'timeout_rate': random.uniform(0.01, 0.05),  # Normal timeout rate
                        'failure_rate': random.uniform(0.01, 0.06),  # Normal failure rate
                        'transaction_count': random.randint(100, 500),
                        'transaction_amount': random.uniform(20000, 100000)
                    }
                
                training_data.append(metrics)
    
    print(f"Generated {len(training_data)} training samples")
    return training_data


def train_models():
    """Train the ML models"""
    print("Starting ML model training...")
    
    try:
        # Generate training data
        training_data = generate_synthetic_training_data(days=30)
        
        if not training_data:
            print("❌ No training data generated")
            return False
        
        # Train Isolation Forest
        print("Training Isolation Forest model...")
        success = ml_anomaly_detector.train_isolation_forest(
            training_data, 
            contamination=0.1
        )
        
        if success:
            print("✅ Isolation Forest model trained successfully")
        else:
            print("❌ Failed to train Isolation Forest model")
            return False
        
        # Test the model
        print("Testing trained model...")
        test_data = training_data[:100]  # Use first 100 samples for testing
        anomalies = ml_anomaly_detector.detect_anomalies(test_data)
        
        print(f"✅ Model test completed. Detected {len(anomalies)} anomalies in test data")
        
        # Test time series anomaly detection
        print("Testing time series anomaly detection...")
        time_series_anomalies = ml_anomaly_detector.detect_time_series_anomalies(test_data)
        print(f"✅ Time series detection completed. Found {len(time_series_anomalies)} time series anomalies")
        
        # Test incident detection
        print("Testing incident detection...")
        from app.services.ml_service import incident_detector
        incidents = incident_detector.detect_incidents(anomalies, test_data)
        print(f"✅ Incident detection completed. Found {len(incidents)} potential incidents")
        
        print("\n🎉 ML model training completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error during training: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = train_models()
    sys.exit(0 if success else 1)