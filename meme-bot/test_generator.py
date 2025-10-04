#!/usr/bin/env python3

"""
Simple test script for the meme generator
"""

try:
    print("Starting test...")
    from meme_generator_clean import MemeGeneratorClean
    print("Import successful")
    
    generator = MemeGeneratorClean()
    print("Generator initialized successfully!")
    
    print("Available categories:", generator.get_topic_categories())
    
    print("Testing text generation...")
    text = generator.generate_meme_text("Gaming addiction")
    print(f"Generated text: {text}")
    
    print("Test completed successfully!")
    
except Exception as e:
    print(f"Error during test: {e}")
    import traceback
    traceback.print_exc()