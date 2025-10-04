#!/usr/bin/env python3
"""
Batch Meme Generator
Generate multiple memes from predefined popular topics for testing and demonstration.
"""

from meme_generator_clean import MemeGeneratorClean
import time

def generate_sample_memes():
    """Generate sample memes from various categories."""
    
    sample_topics = [
        # Youth and Modern Life
        {"topic": "Gen Z explaining crypto to parents", "context": "youth and technology"},
        {"topic": "Online classes vs sleeping schedule", "context": "education and lifestyle"},
        
        # Technology and AI  
        {"topic": "ChatGPT vs Google vs actually knowing stuff", "context": "AI and knowledge"},
        {"topic": "Social media break vs checking phone every 5 minutes", "context": "technology addiction"},
        
        # Indian Culture and Society
        {"topic": "Indian parents asking about salary in family functions", "context": "Indian family culture"},
        {"topic": "Using English vs Hindi in Indian office", "context": "language and workplace"},
        
        # World Events and Current Affairs
        {"topic": "Climate change awareness vs AC usage in summer", "context": "environmental consciousness"},
        {"topic": "Remote work productivity vs home distractions", "context": "work from home culture"},
        
        # Relationships and Dating
        {"topic": "Dating apps vs arranged marriage suggestions", "context": "modern relationships vs tradition"},
        {"topic": "Social media couple goals vs real relationship", "context": "social media reality"},
    ]
    
    print("🎭 Batch Meme Generator Starting...")
    print(f"📊 Will generate {len(sample_topics)} sample memes")
    print("=" * 60)
    
    try:
        generator = MemeGeneratorClean()
        successful_memes = []
        failed_memes = []
        
        for i, topic_data in enumerate(sample_topics, 1):
            topic = topic_data["topic"]
            context = topic_data["context"]
            
            print(f"\n[{i}/{len(sample_topics)}] 🎨 Generating: '{topic}'")
            print(f"📝 Context: {context}")
            
            try:
                filename = generator.create_meme(topic, context)
                
                if filename:
                    successful_memes.append({
                        'topic': topic,
                        'filename': filename,
                        'context': context
                    })
                    print(f"✅ Success: {filename}")
                else:
                    failed_memes.append(topic)
                    print(f"❌ Failed to generate meme")
                    
                # Small delay to avoid overwhelming the API
                time.sleep(2)
                
            except Exception as e:
                failed_memes.append(topic)
                print(f"❌ Error: {e}")
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 BATCH GENERATION SUMMARY")
        print("=" * 60)
        print(f"✅ Successfully generated: {len(successful_memes)} memes")
        print(f"❌ Failed to generate: {len(failed_memes)} memes")
        
        if successful_memes:
            print("\n🎉 Generated Memes:")
            for meme in successful_memes:
                print(f"  📁 {meme['filename']} - {meme['topic'][:50]}...")
        
        if failed_memes:
            print("\n💔 Failed Topics:")
            for topic in failed_memes:
                print(f"  - {topic[:50]}...")
                
        print(f"\n📂 Check the 'memes' folder for your generated memes!")
        print("🎭 Batch generation completed!")
        
    except Exception as e:
        print(f"❌ Error initializing batch generator: {e}")

if __name__ == "__main__":
    generate_sample_memes()