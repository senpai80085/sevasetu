"""
Safety monitoring and anomaly detection module.

This module provides threshold-based anomaly detection for caregiver
monitoring. This is a STUB - in production, this would integrate with
on-device sensors or CV models.

Detection Logic:
    - Monitors motion levels and stillness duration
    - Returns status: NORMAL, WARNING, or ALERT
    - Uses simple threshold rules (no heavy CV model)
"""

from enum import Enum
from typing import Dict, Any
from datetime import datetime


class AnomalyStatus(str, Enum):
    """Enumeration of anomaly detection statuses."""
    NORMAL = "NORMAL"
    WARNING = "WARNING"
    ALERT = "ALERT"


def detect_anomaly(
    motion_level: float,
    stillness_time: int
) -> AnomalyStatus:
    """
    Detect anomalies based on motion and stillness thresholds.
    
    This is a simplified stub. In production, this would integrate with:
    - On-device accelerometer data
    - Computer vision models for fall detection
    - Heart rate monitors
    - Environmental sensors
    
    Args:
        motion_level: Motion intensity (0.0-1.0)
            - 0.0 = completely still
            - 1.0 = high activity
        stillness_time: Duration of stillness in minutes
        
    Returns:
        AnomalyStatus: NORMAL, WARNING, or ALERT
        
    Thresholds:
        ALERT conditions (immediate attention required):
            - No motion (0-0.1) for >30 minutes
            - Extremely high motion (>0.95) sustained
            
        WARNING conditions (check recommended):
            - Low motion (0.1-0.2) for >15 minutes
            - High motion (0.8-0.95) sustained
            
        NORMAL conditions:
            - Regular activity patterns
            - Motion level 0.2-0.8
    """
    # ALERT: Critical situations
    if motion_level < 0.1 and stillness_time > 30:
        # Complete stillness for extended period - possible fall/emergency
        return AnomalyStatus.ALERT
    
    if motion_level > 0.95:
        # Extremely high motion - possible distress or emergency
        return AnomalyStatus.ALERT
    
    # WARNING: Concerning patterns
    if motion_level < 0.2 and stillness_time > 15:
        # Prolonged low activity - check recommended
        return AnomalyStatus.WARNING
    
    if motion_level > 0.8:
        # Sustained high activity - monitor closely
        return AnomalyStatus.WARNING
    
    # NORMAL: Healthy activity patterns
    return AnomalyStatus.NORMAL


def analyze_monitoring_data(
    motion_level: float,
    stillness_time: int,
    timestamp: datetime = None
) -> Dict[str, Any]:
    """
    Comprehensive analysis of monitoring data with explanations.
    
    Args:
        motion_level: Motion intensity (0.0-1.0)
        stillness_time: Stillness duration in minutes
        timestamp: Timestamp of measurement (defaults to now)
        
    Returns:
        Dictionary with status, explanation, and recommendations
    """
    if timestamp is None:
        timestamp = datetime.now()
    
    status = detect_anomaly(motion_level, stillness_time)
    
    # Generate explanation
    if status == AnomalyStatus.ALERT:
        if motion_level < 0.1:
            explanation = f"No movement detected for {stillness_time} minutes. Immediate check required."
            recommendation = "Contact caregiver and/or emergency services immediately"
        else:
            explanation = f"Extremely high activity detected (level: {motion_level:.2f})"
            recommendation = "Check for signs of distress or emergency situation"
    
    elif status == AnomalyStatus.WARNING:
        if motion_level < 0.2:
            explanation = f"Low activity for {stillness_time} minutes. May need attention."
            recommendation = "Contact caregiver to check on patient status"
        else:
            explanation = f"Sustained high activity (level: {motion_level:.2f})"
            recommendation = "Monitor closely for next 10 minutes"
    
    else:  # NORMAL
        explanation = "Activity patterns within normal range"
        recommendation = "Continue regular monitoring"
    
    return {
        "status": status.value,
        "motion_level": motion_level,
        "stillness_time": stillness_time,
        "timestamp": timestamp.isoformat(),
        "explanation": explanation,
        "recommendation": recommendation,
        "requires_action": status != AnomalyStatus.NORMAL
    }


def get_monitoring_guidelines() -> Dict[str, Any]:
    """
    Get monitoring system guidelines and thresholds.
    
    Returns:
        Dictionary with threshold documentation
    """
    return {
        "thresholds": {
            "motion_level": {
                "very_low": "0.0 - 0.1",
                "low": "0.1 - 0.2",
                "normal": "0.2 - 0.8",
                "high": "0.8 - 0.95",
                "very_high": "0.95 - 1.0"
            },
            "stillness_time": {
                "warning": "15 minutes",
                "alert": "30 minutes"
            }
        },
        "production_integration": {
            "sensors": [
                "Accelerometer (motion detection)",
                "Heart rate monitor",
                "Environmental sensors (temperature, etc.)",
                "Computer vision (fall detection)"
            ],
            "data_frequency": "Real-time streaming, 1-second intervals",
            "ml_models": "On-device pose estimation and fall detection"
        },
        "guardian_connection": {
            "how_it_works": (
                "When anomaly detected, system automatically triggers guardian live mode. "
                "Guardian receives push notification and can view live video feed via WebRTC. "
                "Caregiver is also notified to take immediate action."
            )
        }
    }


if __name__ == "__main__":
    # Test scenarios
    print("=== Safety Monitoring Test Scenarios ===\n")
    
    print("Scenario 1: Normal activity")
    result = analyze_monitoring_data(motion_level=0.5, stillness_time=5)
    print(f"Status: {result['status']}")
    print(f"Explanation: {result['explanation']}\n")
    
    print("Scenario 2: Prolonged stillness - WARNING")
    result = analyze_monitoring_data(motion_level=0.15, stillness_time=20)
    print(f"Status: {result['status']}")
    print(f"Explanation: {result['explanation']}")
    print(f"Recommendation: {result['recommendation']}\n")
    
    print("Scenario 3: Extended no motion - ALERT")
    result = analyze_monitoring_data(motion_level=0.05, stillness_time=35)
    print(f"Status: {result['status']}")
    print(f"Explanation: {result['explanation']}")
    print(f"Recommendation: {result['recommendation']}\n")
    
    print("=== Monitoring Guidelines ===")
    guidelines = get_monitoring_guidelines()
    print(f"Thresholds: {guidelines['thresholds']}")
    print(f"\nProduction Integration: {guidelines['production_integration']}")
    print(f"\nGuardian Connection: {guidelines['guardian_connection']['how_it_works']}")
