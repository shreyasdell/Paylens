from fastapi import APIRouter, HTTPException
from app.services.ml_service import ml_anomaly_detector, incident_detector
from app.services.synthetic_data import SyntheticDataGenerator
from typing import Dict, Any, List
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/health")
async def get_aiops_health() -> Dict[str, Any]:
    """Get AIOps system health status"""
    return {
        "status": "healthy",
        "service": "PayLens AIOps",
        "version": "0.1.0",
        "ml_model_trained": ml_anomaly_detector.is_trained,
        "components": {
            "anomaly_detection": "active" if ml_anomaly_detector.is_trained else "inactive",
            "incident_detection": "active",
            "ml_models": "loaded" if ml_anomaly_detector.is_trained else "not_loaded"
        }
    }


@router.get("/metrics")
async def get_aiops_metrics() -> Dict[str, Any]:
    """Get AIOps system metrics"""
    try:
        # Generate synthetic metrics for demonstration
        generator = SyntheticDataGenerator()
        all_metrics = generator.generate_metrics(hours=24)
        # Filter for specific issuer if needed
        metrics = [m for m in all_metrics if m.issuer == "HDFC"]
        
        return {
            "status": "success",
            "metrics": [m.dict() for m in metrics],
            "summary": {
                "total_metrics": len(metrics),
                "issuers": list(set(m.issuer for m in metrics)),
                "time_range": {
                    "start": min(m.timestamp for m in metrics).isoformat(),
                    "end": max(m.timestamp for m in metrics).isoformat()
                }
            }
        }
    except Exception as e:
        logger.error(f"Failed to get AIOps metrics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/detect-anomalies")
async def detect_anomalies(request_data: Dict[str, Any] = None) -> Dict[str, Any]:
    """Detect anomalies in payment metrics"""
    try:
        metrics_dict = []
        
        # Use provided metrics or generate synthetic ones
        if request_data and "metrics" in request_data:
            metrics_dict = request_data["metrics"]
        else:
            # Generate synthetic metrics for demonstration
            generator = SyntheticDataGenerator()
            all_metrics = generator.generate_metrics(hours=24)
            metrics = [m for m in all_metrics if m.issuer == "HDFC"]
            # Convert to dict format for ML service
            metrics_dict = [m.dict() for m in metrics] if metrics else []
        
        # Detect anomalies
        anomalies = ml_anomaly_detector.detect_anomalies(metrics_dict)
        
        return {
            "status": "success",
            "anomalies": anomalies,
            "anomaly_count": len(anomalies),
            "metrics_analyzed": len(metrics_dict),
            "detection_method": "isolation_forest" if ml_anomaly_detector.is_trained else "statistical"
        }
    except Exception as e:
        logger.error(f"Failed to detect anomalies: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/detect-time-series-anomalies")
async def detect_time_series_anomalies(request_data: Dict[str, Any]) -> Dict[str, Any]:
    """Detect anomalies in time series data"""
    try:
        metrics = request_data.get("metrics", [])
        
        if not metrics:
            raise HTTPException(status_code=400, detail="No metrics provided")
        
        # Detect time series anomalies
        anomalies = ml_anomaly_detector.detect_time_series_anomalies(metrics)
        
        return {
            "status": "success",
            "anomalies": anomalies,
            "anomaly_count": len(anomalies),
            "data_points": len(metrics)
        }
    except Exception as e:
        logger.error(f"Failed to detect time series anomalies: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/detect-incidents")
async def detect_incidents(request_data: Dict[str, Any]) -> Dict[str, Any]:
    """Detect incidents from anomaly patterns"""
    try:
        anomalies = request_data.get("anomalies", [])
        metrics = request_data.get("metrics", [])
        
        if not anomalies:
            raise HTTPException(status_code=400, detail="No anomalies provided")
        
        # Detect incidents
        incidents = incident_detector.detect_incidents(anomalies, metrics)
        
        return {
            "status": "success",
            "incidents": incidents,
            "incident_count": len(incidents),
            "anomaly_count": len(anomalies)
        }
    except Exception as e:
        logger.error(f"Failed to detect incidents: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/train-model")
async def train_model(request_data: Dict[str, Any]) -> Dict[str, Any]:
    """Train ML anomaly detection model"""
    try:
        training_data = request_data.get("training_data")
        contamination = request_data.get("contamination", 0.1)
        
        if not training_data:
            raise HTTPException(status_code=400, detail="No training data provided")
        
        # Train the model
        success = ml_anomaly_detector.train_isolation_forest(training_data, contamination)
        
        if success:
            return {
                "status": "success",
                "message": "ML model trained successfully",
                "training_samples": len(training_data),
                "contamination": contamination,
                "is_trained": ml_anomaly_detector.is_trained
            }
        else:
            raise HTTPException(status_code=500, detail="Model training failed")
            
    except Exception as e:
        logger.error(f"Failed to train model: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/model-status")
async def get_model_status() -> Dict[str, Any]:
    """Get ML model status"""
    return {
        "status": "success",
        "is_trained": ml_anomaly_detector.is_trained,
        "model_info": {
            "type": "IsolationForest",
            "features": ml_anomaly_detector.feature_columns,
            "model_path": str(ml_anomaly_detector.model_path) if ml_anomaly_detector.model_path.exists() else "not_found"
        },
        "capabilities": {
            "anomaly_detection": True,
            "time_series_analysis": True,
            "incident_detection": True
        }
    }