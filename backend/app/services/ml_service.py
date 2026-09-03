"""
ML Service for Anomaly Detection in Payment Systems
Implements Isolation Forest and statistical methods for detecting anomalies
"""
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import DBSCAN
from typing import Dict, List, Any, Optional, Tuple
import logging
from datetime import datetime, timedelta
import json
from pathlib import Path

logger = logging.getLogger(__name__)


class MLAnomalyDetector:
    """ML-based anomaly detection for payment systems"""
    
    def __init__(self):
        self.isolation_forest = None
        self.scaler = StandardScaler()
        self.is_trained = False
        self.feature_columns = [
            'latency_ms', 'success_rate', 'timeout_rate', 'failure_rate'
        ]
        self.model_path = Path("./data/models/anomaly_detector.pkl")
        self._load_model_if_exists()
    
    def _load_model_if_exists(self):
        """Load pre-trained model if available"""
        try:
            if self.model_path.exists():
                import joblib
                self.isolation_forest = joblib.load(self.model_path)
                self.is_trained = True
                logger.info("Loaded pre-trained anomaly detection model")
        except Exception as e:
            logger.warning(f"Could not load pre-trained model: {e}")
            self.is_trained = False
    
    def _save_model(self):
        """Save trained model to disk"""
        try:
            self.model_path.parent.mkdir(parents=True, exist_ok=True)
            import joblib
            joblib.dump(self.isolation_forest, self.model_path)
            logger.info(f"Saved trained model to {self.model_path}")
        except Exception as e:
            logger.error(f"Failed to save model: {e}")
    
    def prepare_features(self, metrics_data: List[Dict]) -> np.ndarray:
        """Prepare features for ML model"""
        if not metrics_data:
            return np.array([])
        
        df = pd.DataFrame(metrics_data)
        
        # Ensure all required columns exist with default values
        for col in self.feature_columns:
            if col not in df.columns:
                df[col] = 0  # Default value for missing features
        
        # Select and order features
        features = df[self.feature_columns].values
        
        # Handle NaN values
        features = np.nan_to_num(features, nan=0.0)
        
        return features
    
    def train_isolation_forest(self, training_data: List[Dict], contamination: float = 0.1):
        """Train Isolation Forest model on historical data"""
        try:
            logger.info(f"Training Isolation Forest with {len(training_data)} samples")
            
            features = self.prepare_features(training_data)
            
            if len(features) == 0:
                logger.error("No features available for training")
                return False
            
            # Scale features
            scaled_features = self.scaler.fit_transform(features)
            
            # Train Isolation Forest
            self.isolation_forest = IsolationForest(
                contamination=contamination,
                random_state=42,
                n_estimators=100
            )
            
            self.isolation_forest.fit(scaled_features)
            self.is_trained = True
            
            # Save model
            self._save_model()
            
            logger.info("Isolation Forest training completed successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to train Isolation Forest: {e}")
            return False
    
    def detect_anomalies(self, current_data: List[Dict]) -> List[Dict[str, Any]]:
        """Detect anomalies in current payment metrics"""
        if not self.is_trained:
            logger.warning("Model not trained, using statistical fallback")
            return self._statistical_anomaly_detection(current_data)
        
        try:
            features = self.prepare_features(current_data)
            
            if len(features) == 0:
                return []
            
            # Scale features
            scaled_features = self.scaler.transform(features)
            
            # Predict anomalies (-1 for anomaly, 1 for normal)
            predictions = self.isolation_forest.predict(scaled_features)
            anomaly_scores = self.isolation_forest.score_samples(scaled_features)
            
            # Format results
            anomalies = []
            for i, (pred, score) in enumerate(zip(predictions, anomaly_scores)):
                if pred == -1:  # Anomaly detected
                    anomalies.append({
                        'index': i,
                        'anomaly_score': float(score),
                        'severity': self._calculate_severity(score),
                        'data': current_data[i],
                        'timestamp': current_data[i].get('timestamp', datetime.utcnow().isoformat()),
                        'type': 'isolation_forest'
                    })
            
            logger.info(f"Detected {len(anomalies)} anomalies using Isolation Forest")
            return anomalies
            
        except Exception as e:
            logger.error(f"ML anomaly detection failed: {e}")
            return self._statistical_anomaly_detection(current_data)
    
    def _statistical_anomaly_detection(self, data: List[Dict]) -> List[Dict[str, Any]]:
        """Statistical fallback for anomaly detection"""
        anomalies = []
        
        if not data:
            return anomalies
        
        try:
            df = pd.DataFrame(data)
            
            # Calculate statistical thresholds
            for col in ['latency_ms', 'timeout_rate', 'failure_rate']:
                if col in df.columns:
                    mean = df[col].mean()
                    std = df[col].std()
                    threshold = mean + 3 * std  # 3-sigma rule
                    
                    # Find anomalies
                    anomalous_rows = df[df[col] > threshold]
                    
                    for idx, row in anomalous_rows.iterrows():
                        anomalies.append({
                            'index': idx,
                            'anomaly_score': float((row[col] - mean) / std),
                            'severity': 'high' if (row[col] - mean) / std > 4 else 'medium',
                            'data': row.to_dict(),
                            'timestamp': row.get('timestamp', datetime.utcnow().isoformat()),
                            'type': 'statistical',
                            'metric': col,
                            'threshold': threshold,
                            'value': float(row[col])
                        })
            
            logger.info(f"Detected {len(anomalies)} anomalies using statistical methods")
            return anomalies
            
        except Exception as e:
            logger.error(f"Statistical anomaly detection failed: {e}")
            return []
    
    def _calculate_severity(self, anomaly_score: float) -> str:
        """Calculate severity based on anomaly score"""
        if anomaly_score < -0.7:
            return 'critical'
        elif anomaly_score < -0.5:
            return 'high'
        elif anomaly_score < -0.3:
            return 'medium'
        else:
            return 'low'
    
    def detect_time_series_anomalies(self, time_series_data: List[Dict], window_size: int = 10) -> List[Dict[str, Any]]:
        """Detect anomalies in time series data using moving averages"""
        anomalies = []
        
        if len(time_series_data) < window_size * 2:
            logger.warning(f"Insufficient data for time series analysis (need {window_size * 2}, got {len(time_series_data)})")
            return anomalies
        
        try:
            df = pd.DataFrame(time_series_data)
            df = df.sort_values('timestamp')
            
            for col in ['latency_ms', 'timeout_rate', 'failure_rate']:
                if col in df.columns:
                    # Calculate moving average and standard deviation
                    df[f'{col}_ma'] = df[col].rolling(window=window_size).mean()
                    df[f'{col}_std'] = df[col].rolling(window=window_size).std()
                    
                    # Detect anomalies (values outside 2 standard deviations of moving average)
                    mask = (
                        (df[col] > df[f'{col}_ma'] + 2 * df[f'{col}_std']) |
                        (df[col] < df[f'{col}_ma'] - 2 * df[f'{col}_std'])
                    ) & (~df[f'{col}_ma'].isna())
                    
                    anomalous_points = df[mask]
                    
                    for idx, row in anomalous_points.iterrows():
                        z_score = abs((row[col] - row[f'{col}_ma']) / row[f'{col}_std']) if row[f'{col}_std'] > 0 else 0
                        
                        anomalies.append({
                            'index': idx,
                            'anomaly_score': float(z_score),
                            'severity': 'critical' if z_score > 3 else 'high' if z_score > 2 else 'medium',
                            'data': row.to_dict(),
                            'timestamp': row.get('timestamp', datetime.utcnow().isoformat()),
                            'type': 'time_series',
                            'metric': col,
                            'moving_average': float(row[f'{col}_ma']),
                            'deviation': float(row[f'{col}_std'])
                        })
            
            logger.info(f"Detected {len(anomalies)} time series anomalies")
            return anomalies
            
        except Exception as e:
            logger.error(f"Time series anomaly detection failed: {e}")
            return []
    
    def generate_training_data(self, historical_metrics: List[Dict], days: int = 30) -> List[Dict]:
        """Generate training data from historical metrics"""
        training_data = []
        
        try:
            # Group by issuer and time windows
            df = pd.DataFrame(historical_metrics)
            
            if df.empty:
                return training_data
            
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            df['hour'] = df['timestamp'].dt.floor('H')
            
            # Aggregate by hour and issuer
            hourly_data = df.groupby(['issuer', 'hour']).agg({
                'latency_ms': 'mean',
                'success_rate': 'mean',
                'timeout_rate': 'mean',
                'failure_rate': 'mean',
                'payment_id': 'count'  # Transaction count
            }).reset_index()
            
            # Rename payment_id to transaction_count
            hourly_data = hourly_data.rename(columns={'payment_id': 'transaction_count'})
            
            # Add transaction amount (simulated)
            hourly_data['transaction_amount'] = hourly_data['transaction_count'] * np.random.uniform(100, 5000, len(hourly_data))
            
            training_data = hourly_data.to_dict('records')
            
            logger.info(f"Generated {len(training_data)} training samples from {len(historical_metrics)} raw metrics")
            return training_data
            
        except Exception as e:
            logger.error(f"Failed to generate training data: {e}")
            return training_data


class IncidentDetector:
    """Detect systemic payment incidents from anomaly patterns"""
    
    def __init__(self):
        self.anomaly_threshold = 3  # Number of anomalies to trigger incident
        self.time_window_minutes = 15  # Time window for incident detection
    
    def detect_incidents(self, anomalies: List[Dict], metrics: List[Dict]) -> List[Dict[str, Any]]:
        """Detect systemic incidents from anomaly patterns"""
        incidents = []
        
        if not anomalies:
            return incidents
        
        try:
            # Group anomalies by issuer and time
            df = pd.DataFrame(anomalies)
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            
            # Group by issuer
            for issuer in df['data'].apply(lambda x: x.get('issuer', 'unknown')).unique():
                issuer_anomalies = df[df['data'].apply(lambda x: x.get('issuer', 'unknown')) == issuer]
                
                # Check if anomaly count exceeds threshold
                if len(issuer_anomalies) >= self.anomaly_threshold:
                    # Determine incident type based on anomaly patterns
                    incident_type = self._classify_incident_type(issuer_anomalies)
                    severity = self._calculate_incident_severity(issuer_anomalies)
                    
                    incidents.append({
                        'incident_id': f"INC{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
                        'issuer': issuer,
                        'issue': incident_type,
                        'severity': severity,
                        'status': 'detected',
                        'created_at': datetime.utcnow().isoformat(),
                        'updated_at': datetime.utcnow().isoformat(),
                        'anomaly_count': len(issuer_anomalies),
                        'affected_metrics': issuer_anomalies['metric'].unique().tolist() if 'metric' in issuer_anomalies.columns else [],
                        'description': f"Systemic {incident_type} detected for {issuer} based on {len(issuer_anomalies)} anomalies"
                    })
            
            logger.info(f"Detected {len(incidents)} potential incidents")
            return incidents
            
        except Exception as e:
            logger.error(f"Incident detection failed: {e}")
            return []
    
    def _classify_incident_type(self, anomalies: pd.DataFrame) -> str:
        """Classify incident type based on anomaly patterns"""
        if 'metric' in anomalies.columns:
            metrics = anomalies['metric'].value_counts()
            
            if 'timeout_rate' in metrics.index and metrics['timeout_rate'] > len(anomalies) / 2:
                return "Elevated timeout rate"
            elif 'failure_rate' in metrics.index and metrics['failure_rate'] > len(anomalies) / 2:
                return "Payment processing degradation"
            elif 'latency_ms' in metrics.index and metrics['latency_ms'] > len(anomalies) / 2:
                return "High latency detected"
            else:
                return "Multi-metric anomaly"
        
        return "General payment anomaly"
    
    def _calculate_incident_severity(self, anomalies: pd.DataFrame) -> str:
        """Calculate incident severity based on anomaly patterns"""
        if 'severity' in anomalies.columns:
            severity_counts = anomalies['severity'].value_counts()
            
            if 'critical' in severity_counts.index and severity_counts['critical'] > len(anomalies) / 3:
                return 'CRITICAL'
            elif 'high' in severity_counts.index and severity_counts['high'] > len(anomalies) / 2:
                return 'HIGH'
            else:
                return 'MEDIUM'
        
        return 'MEDIUM'


# Singleton instances
ml_anomaly_detector = MLAnomalyDetector()
incident_detector = IncidentDetector()