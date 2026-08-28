#!/usr/bin/env python3
"""
Script to generate synthetic payment infrastructure data
"""
import sys
import os

# Add the parent directory to the path so we can import from app
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.synthetic_data import SyntheticDataGenerator


def main():
    print("Generating synthetic data for PayLens...")
    
    # Create generator with 10,000 transactions
    generator = SyntheticDataGenerator(num_transactions=10000)
    
    # Generate all data
    data = generator.generate_all()
    
    # Save to JSON files
    generator.save_to_json()
    
    print(f"✅ Generated {len(data['transactions'])} transactions")
    print(f"✅ Generated {len(data['logs'])} log entries")
    print(f"✅ Generated {len(data['metrics'])} metric entries")
    print(f"✅ Generated {len(data['incidents'])} incidents")
    print("✅ Data saved to ./data/synthetic/")


if __name__ == "__main__":
    main()