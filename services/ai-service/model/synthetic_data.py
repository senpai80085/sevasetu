"""
Synthetic data generator for AI matching model.

This module generates synthetic training data for the caregiver matching
model. Since we don't have real historical data, we create realistic
synthetic examples.

Model Assumptions:
1. Higher skill match correlates with better outcomes
2. Closer distance improves service quality
3. More experience generally leads to better service
4. Higher existing ratings indicate better service
5. Price is inversely related to match quality (budget constraints)
"""

import numpy as np
import pandas as pd
from typing import Tuple


def generate_synthetic_dataset(n_samples: int = 1000) -> Tuple[pd.DataFrame, np.ndarray]:
    """
    Generate synthetic training data for match scoring.
    
    Creates realistic caregiver-civilian matching scenarios with
    computed match scores based on weighted features.
    
    Args:
        n_samples: Number of training samples to generate
        
    Returns:
        Tuple of (features_df, match_scores array)
        
    Features:
        - skill_match_score: 0.0-1.0 (overlap of required vs offered skills)
        - distance_score: 0.0-1.0 (1.0 = very close, 0.0 = very far)
        - experience_years: 0-20 years
        - rating_average: 1.0-5.0
        - price: Normalized price 0.0-1.0
        
    Match Score Formula:
        score = (0.35 * skill_match) + (0.15 * distance) + 
                (0.20 * exp_norm) + (0.25 * rating_norm) - (0.05 * price)
    """
    np.random.seed(42)
    
    # Generate features
    skill_match_scores = np.random.beta(5, 2, n_samples)  # Skewed toward higher matches
    distance_scores = np.random.beta(3, 3, n_samples)     # More centered distribution
    experience_years = np.random.gamma(3, 2, n_samples)   # Realistic experience distribution
    experience_years = np.clip(experience_years, 0, 20)   # Cap at 20 years
    rating_averages = np.random.beta(8, 2, n_samples) * 4 + 1  # Skewed toward 4-5 stars
    prices = np.random.beta(3, 3, n_samples)              # Varied pricing
    
    # Normalize experience and ratings for scoring
    exp_normalized = experience_years / 20.0
    rating_normalized = (rating_averages - 1.0) / 4.0  # Map [1,5] to [0,1]
    
    # Calculate match scores with weighted formula
    # Weights: skill=0.35, distance=0.15, experience=0.20, rating=0.25, price=-0.05
    match_scores = (
        0.35 * skill_match_scores +
        0.15 * distance_scores +
        0.20 * exp_normalized +
        0.25 * rating_normalized -
        0.05 * prices
    )
    
    # Add realistic noise
    noise = np.random.normal(0, 0.05, n_samples)
    match_scores = np.clip(match_scores + noise, 0, 1)
    
    # Create DataFrame
    features_df = pd.DataFrame({
        'skill_match_score': skill_match_scores,
        'distance_score': distance_scores,
        'experience_years': experience_years,
        'rating_average': rating_averages,
        'price': prices
    })
    
    return features_df, match_scores


if __name__ == "__main__":
    # Test data generation
    X, y = generate_synthetic_dataset(100)
    print("Generated synthetic dataset:")
    print(X.head())
    print(f"\nMatch scores range: {y.min():.3f} - {y.max():.3f}")
    print(f"Mean match score: {y.mean():.3f}")
