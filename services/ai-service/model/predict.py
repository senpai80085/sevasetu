"""
Prediction module for caregiver matching model.

This module loads the trained model and makes match score predictions.
"""

import joblib
import pandas as pd
import numpy as np
from pathlib import Path
from typing import List, Dict, Any


class CaregiverMatcher:
    """
    Caregiver matching prediction engine.
    
    Loads trained RandomForestRegressor and predicts match scores
    for caregiver-civilian pairings.
    """
    
    def __init__(self, model_path: str = "caregiver_matcher.pkl"):
        """
        Initialize matcher with trained model.
        
        Args:
            model_path: Path to trained model file
        """
        full_path = Path(__file__).parent / model_path
        if not full_path.exists():
            raise FileNotFoundError(
                f"Model file not found: {full_path}. "
                "Run train.py first to generate the model."
            )
        
        self.model = joblib.load(full_path)
        self.feature_names = [
            'skill_match_score',
            'distance_score',
            'experience_years',
            'rating_average',
            'price'
        ]
    
    def predict_match_score(self, caregiver_data: Dict[str, Any]) -> float:
        """
        Predict match score for a single caregiver.
        
        Args:
            caregiver_data: Dictionary with required features
            
        Returns:
            Predicted match score (0.0-1.0)
        """
        # Extract features in correct order
        features = [caregiver_data.get(name, 0.0) for name in self.feature_names]
        
        # Convert to DataFrame for prediction
        X = pd.DataFrame([features], columns=self.feature_names)
        
        # Predict
        score = self.model.predict(X)[0]
        
        # Clip to valid range
        return float(np.clip(score, 0.0, 1.0))
    
    def rank_caregivers(self, caregivers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Rank multiple caregivers by match score.
        
        Args:
            caregivers: List of caregiver data dictionaries
            
        Returns:
            Caregivers sorted by match score (descending)
        """
        # Add match scores to each caregiver
        for caregiver in caregivers:
            caregiver['match_score'] = self.predict_match_score(caregiver)
        
        # Sort by match score (highest first)
        ranked = sorted(caregivers, key=lambda x: x['match_score'], reverse=True)
        
        return ranked


if __name__ == "__main__":
    # Test prediction
    matcher = CaregiverMatcher()
    
    test_caregiver = {
        'skill_match_score': 0.8,
        'distance_score': 0.6,
        'experience_years': 5,
        'rating_average': 4.5,
        'price': 0.5
    }
    
    score = matcher.predict_match_score(test_caregiver)
    print(f"Predicted match score: {score:.4f}")
