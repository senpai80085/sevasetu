"""
Model package for AI matching service.
"""

from .predict import CaregiverMatcher
from .train import train_model
from .synthetic_data import generate_synthetic_dataset

__all__ = ["CaregiverMatcher", "train_model", "generate_synthetic_dataset"]
