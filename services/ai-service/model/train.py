"""
Machine learning model training for caregiver matching.

This module trains a RandomForestRegressor to predict match scores
between caregivers and care requests.

Model Approach:
- Algorithm: RandomForestRegressor (ensemble method, handles non-linear relationships)
- Target: Match score (0.0-1.0)
- Features: skill match, distance, experience, rating, price
- Training: Synthetic data (1000 samples)
- Validation: 80/20 train-test split
"""

import joblib
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
from pathlib import Path
from synthetic_data import generate_synthetic_dataset


def train_model(n_samples: int = 1000, save_path: str = "caregiver_matcher.pkl"):
    """
    Train RandomForestRegressor on synthetic caregiver matching data.
    
    Args:
        n_samples: Number of synthetic training samples
        save_path: Path to save trained model
        
    Returns:
        Trained model and evaluation metrics
        
    Model Hyperparameters:
        - n_estimators: 100 trees (balanced accuracy/speed)
        - max_depth: 10 (prevent overfitting)
        - min_samples_split: 5 (require minimum data for splits)
        - random_state: 42 (reproducibility)
    """
    print(f"Generating {n_samples} synthetic training samples...")
    X, y = generate_synthetic_dataset(n_samples)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    print(f"Training set: {len(X_train)} samples")
    print(f"Test set: {len(X_test)} samples")
    
    # Initialize and train model
    print("\nTraining RandomForestRegressor...")
    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=10,
        min_samples_split=5,
        random_state=42,
        n_jobs=-1  # Use all CPU cores
    )
    
    model.fit(X_train, y_train)
    
    # Evaluate
    train_pred = model.predict(X_train)
    test_pred = model.predict(X_test)
    
    train_mse = mean_squared_error(y_train, train_pred)
    test_mse = mean_squared_error(y_test, test_pred)
    train_r2 = r2_score(y_train, train_pred)
    test_r2 = r2_score(y_test, test_pred)
    
    print("\n=== Model Performance ===")
    print(f"Train MSE: {train_mse:.6f}")
    print(f"Test MSE: {test_mse:.6f}")
    print(f"Train R²: {train_r2:.4f}")
    print(f"Test R²: {test_r2:.4f}")
    
    # Feature importance
    feature_names = X.columns
    importances = model.feature_importances_
    
    print("\n=== Feature Importance ===")
    for name, importance in sorted(zip(feature_names, importances), 
                                   key=lambda x: x[1], reverse=True):
        print(f"{name}: {importance:.4f}")
    
    # Save model
    model_path = Path(__file__).parent / save_path
    joblib.dump(model, model_path)
    print(f"\nModel saved to: {model_path}")
    
    return model, {
        "train_mse": train_mse,
        "test_mse": test_mse,
        "train_r2": train_r2,
        "test_r2": test_r2,
        "feature_importance": dict(zip(feature_names, importances))
    }


if __name__ == "__main__":
    model, metrics = train_model()
