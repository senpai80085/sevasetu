"""
Alert escalation manager for guardian mode.

Prevents spam by implementing escalation ladder:
1st alert → notification only
2nd alert within 5 minutes → guardian prompt
3rd alert within 5 minutes → allow live mode
"""

from datetime import datetime, timedelta
from typing import Dict, List, Optional
from enum import Enum


class AlertAction(str, Enum):
    """Recommended action for anomaly alert."""
    NOTIFY = "notify"  # Send notification only
    PROMPT = "prompt"  # Ask guardian if they want to view
    ALLOW_LIVE = "allow_live"  # Enable live mode


class AlertManager:
    """
    Manages alert escalation to prevent guardian mode spam.
    
    Tracks alert history per civilian and recommends appropriate action
    based on escalation ladder.
    """
    
    def __init__(self, escalation_window_minutes: int = 5):
        """
        Initialize alert manager.
        
        Args:
            escalation_window_minutes: Time window for counting alerts
        """
        self.escalation_window = timedelta(minutes=escalation_window_minutes)
        # Format: {civilian_id: [alert_timestamps]}
        self.alert_history: Dict[int, List[datetime]] = {}
    
    def record_alert(self, civilian_id: int) -> AlertAction:
        """
        Record a new alert and determine appropriate action.
        
        Escalation ladder:
        - 1st alert in window → NOTIFY
        - 2nd alert in window → PROMPT
        - 3rd+ alert in window → ALLOW_LIVE
        
        Args:
            civilian_id: Civilian ID for tracking
            
        Returns:
            Recommended action based on escalation
        """
        now = datetime.now()
        
        # Initialize if first alert for this civilian
        if civilian_id not in self.alert_history:
            self.alert_history[civilian_id] = []
        
        # Clean up old alerts outside window
        cutoff_time = now - self.escalation_window
        self.alert_history[civilian_id] = [
            ts for ts in self.alert_history[civilian_id]
            if ts > cutoff_time
        ]
        
        # Count recent alerts
        recent_alert_count = len(self.alert_history[civilian_id])
        
        # Record new alert
        self.alert_history[civilian_id].append(now)
        
        # Determine action based on escalation
        if recent_alert_count == 0:
            # First alert - just notify
            return AlertAction.NOTIFY
        elif recent_alert_count == 1:
            # Second alert - prompt guardian
            return AlertAction.PROMPT
        else:
            # Third+ alert - allow live mode
            return AlertAction.ALLOW_LIVE
    
    def get_alert_count(self, civilian_id: int) -> int:
        """
        Get number of recent alerts for a civilian.
        
        Args:
            civilian_id: Civilian ID
            
        Returns:
            Count of alerts in escalation window
        """
        if civilian_id not in self.alert_history:
            return 0
        
        # Clean up old alerts
        now = datetime.now()
        cutoff_time = now - self.escalation_window
        self.alert_history[civilian_id] = [
            ts for ts in self.alert_history[civilian_id]
            if ts > cutoff_time
        ]
        
        return len(self.alert_history[civilian_id])
    
    def reset_alerts(self, civilian_id: int):
        """
        Reset alert history for a civilian.
        
        Called when guardian views live mode or situation resolves.
        
        Args:
            civilian_id: Civilian ID
        """
        if civilian_id in self.alert_history:
            self.alert_history[civilian_id] = []


# Global instance
_alert_manager = AlertManager()


def get_alert_action(civilian_id: int) -> Dict[str, any]:
    """
    Record alert and get recommended action.
    
    Args:
        civilian_id: Civilian ID
        
    Returns:
        Dictionary with action and explanation
    """
    action = _alert_manager.record_alert(civilian_id)
    count = _alert_manager.get_alert_count(civilian_id)
    
    explanations = {
        AlertAction.NOTIFY: f"First alert - sending notification to guardian",
        AlertAction.PROMPT: f"Second alert in 5 minutes - prompting guardian to view live feed",
        AlertAction.ALLOW_LIVE: f"Multiple alerts ({count} in 5 min) - auto-enabling live guardian mode"
    }
    
    return {
        "action": action.value,
        "recent_alert_count": count,
        "explanation": explanations[action],
        "should_start_guardian_session": action == AlertAction.ALLOW_LIVE
    }


def reset_civilian_alerts(civilian_id: int):
    """Reset alert history for civilian."""
    _alert_manager.reset_alerts(civilian_id)


if __name__ == "__main__":
    # Test escalation ladder
    print("=== Testing Alert Escalation ===\n")
    
    civilian_id = 1
    
    print("Alert 1:")
    result = get_alert_action(civilian_id)
    print(f"  Action: {result['action']}")
    print(f"  Explanation: {result['explanation']}\n")
    
    print("Alert 2 (within 5 min):")
    result = get_alert_action(civilian_id)
    print(f"  Action: {result['action']}")
    print(f"  Explanation: {result['explanation']}\n")
    
    print("Alert 3 (within 5 min):")
    result = get_alert_action(civilian_id)
    print(f"  Action: {result['action']}")
    print(f"  Explanation: {result['explanation']}")
    print(f"  Start guardian session: {result['should_start_guardian_session']}\n")
    
    print("Resetting alerts...")
    reset_civilian_alerts(civilian_id)
    print(f"Alert count after reset: {_alert_manager.get_alert_count(civilian_id)}")
