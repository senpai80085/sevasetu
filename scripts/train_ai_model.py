"""
Train the AI matching model with synthetic data.

This script generates synthetic training data and trains
the RandomForest model used for caregiver matching.
"""


def main():
    """Generate data and train model."""
    import sys
    import os
    
    print("=== AI Model Training ===\n")
    
    # Change to ai-service/model directory
    model_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 
                             'services', 'ai-service', 'model')
    os.chdir(model_dir)
    
    # Import from current directory
    from synthetic_data import generate_synthetic_dataset
    from train import train_model
    
    # Generate synthetic training data
    print("Step 1: Generating synthetic training data...")
    dataset_path = generate_synthetic_dataset(num_samples=1000)
    print(f"✓ Dataset created: {dataset_path}\n")
    
    # Train model
    print("Step 2: Training RandomForest model...")
    model_path = train_model()
    print(f"✓ Model trained and saved: {model_path}\n")
    
    print("✅ AI model ready for use!")
    print("\nThe model will be automatically loaded by the AI service.")


if __name__ == "__main__":
    main()
