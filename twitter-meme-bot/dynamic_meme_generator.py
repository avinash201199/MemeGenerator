#!/usr/bin/env python3
"""
Dynamic Meme Generator
A user-friendly script to generate memes on various topics without needing JSON files.
Supports diverse topics including youth issues, world events, technology, and more.
"""

from meme_generator_clean import MemeGeneratorClean
import random

def display_welcome():
    """Display welcome message and instructions."""
    print("\n" + "="*60)
    print("🎭 DYNAMIC MEME GENERATOR 🎭")
    print("="*60)
    print("Generate hilarious memes on ANY topic!")
    print("From youth problems to world events, technology to relationships!")
    print("="*60)

def get_topic_categories():
    """Return predefined topic categories with examples."""
    return {
        "1": {
            "name": "Youth & Gen Z Issues",
            "examples": [
                "Gen Z job interview expectations vs reality",
                "Social media addiction among youth",
                "Online classes vs offline experience",
                "Gig economy and side hustles struggle",
                "Mental health awareness in young generation"
            ]
        },
        "2": {
            "name": "World Current Events",
            "examples": [
                "AI taking over jobs but can't cook like mom",
                "Climate change activists vs daily lifestyle",
                "Cryptocurrency investment vs traditional savings",
                "Remote work culture post-pandemic",
                "Social media influencing real-world events"
            ]
        },
        "3": {
            "name": "Indian Society & Culture",
            "examples": [
                "Traditional Indian parents vs modern kids",
                "Festival celebrations in metro cities vs villages",
                "Arranged marriage in digital age",
                "Regional language vs English preference",
                "Indian food culture vs fast food adoption"
            ]
        },
        "4": {
            "name": "Technology & AI",
            "examples": [
                "ChatGPT helping with homework",
                "Instagram reality vs actual life",
                "Online shopping vs physical store experience",
                "Smartphone addiction and real conversations",
                "Video call meetings and technical difficulties"
            ]
        },
        "5": {
            "name": "Relationships & Dating",
            "examples": [
                "Modern dating apps vs traditional meetings",
                "Long distance relationships in digital age",
                "Social media affecting real relationships",
                "Friendship in online vs offline world",
                "Dating expectations vs reality in 2024"
            ]
        },
        "6": {
            "name": "Education & Career",
            "examples": [
                "College placement season stress",
                "Skill development vs degree importance",
                "Internship expectations vs reality",
                "Work from home vs office culture",
                "Student loan burden and career choices"
            ]
        },
        "7": {
            "name": "Finance & Economy",
            "examples": [
                "Salary expectations vs actual paycheck",
                "Inflation affecting daily life choices",
                "Investment advice vs actual market reality",
                "EMI culture and financial planning",
                "Savings goals vs online shopping temptations"
            ]
        },
        "8": {
            "name": "Health & Lifestyle",
            "examples": [
                "Fitness influencer advice vs gym reality",
                "Diet plans vs food delivery apps",
                "Mental health awareness vs societal stigma",
                "Work-life balance in modern times",
                "Health consciousness vs junk food addiction"
            ]
        }
    }

def display_categories():
    """Display all available topic categories."""
    categories = get_topic_categories()
    print("\n📱 Available Topic Categories:")
    print("-" * 40)
    
    for key, category in categories.items():
        print(f"{key}. {category['name']}")
    
    print("9. Custom Topic (Enter your own)")
    print("0. Random Selection (Surprise me!)")

def get_user_choice():
    """Get and validate user's category choice."""
    categories = get_topic_categories()
    
    while True:
        try:
            choice = input("\nSelect a category (0-9): ").strip()
            
            if choice in categories:
                return choice, categories[choice]
            elif choice == "9":
                return "9", {"name": "Custom Topic", "examples": []}
            elif choice == "0":
                return "0", {"name": "Random Selection", "examples": []}
            else:
                print("❌ Invalid choice! Please select a number between 0-9.")
                
        except KeyboardInterrupt:
            print("\n\nGoodbye! 👋")
            return None, None

def get_topic_from_category(category_data):
    """Get specific topic from selected category."""
    if not category_data:
        return None, None
        
    category_name = category_data["name"]
    examples = category_data["examples"]
    
    if category_name == "Custom Topic":
        topic = input("\n💭 Enter your custom meme topic: ").strip()
        context = input("📝 Enter additional context (optional): ").strip()
        return topic if topic else "Random daily life", context if context else None
    
    elif category_name == "Random Selection":
        all_categories = get_topic_categories()
        random_category = random.choice(list(all_categories.values()))
        random_topic = random.choice(random_category["examples"])
        context = f"{random_category['name'].lower()}"
        print(f"\n🎲 Random topic selected: {random_topic}")
        return random_topic, context
    
    else:
        print(f"\n📋 {category_name} - Example Topics:")
        print("-" * 50)
        for i, example in enumerate(examples, 1):
            print(f"{i}. {example}")
        
        print(f"{len(examples) + 1}. Enter my own topic for this category")
        
        try:
            topic_choice = input(f"\nSelect a topic (1-{len(examples) + 1}): ").strip()
            
            if topic_choice.isdigit():
                choice_num = int(topic_choice)
                if 1 <= choice_num <= len(examples):
                    selected_topic = examples[choice_num - 1]
                    context = category_name.lower()
                    return selected_topic, context
                elif choice_num == len(examples) + 1:
                    custom_topic = input(f"\n💭 Enter your {category_name.lower()} topic: ").strip()
                    context = category_name.lower()
                    return custom_topic if custom_topic else examples[0], context
            
            # If invalid input, return first example
            print("⚠️ Invalid selection, using first example topic.")
            return examples[0], category_name.lower()
            
        except (ValueError, IndexError):
            print("⚠️ Invalid input, using first example topic.")
            return examples[0], category_name.lower()

def generate_meme_interactive():
    """Main interactive meme generation function."""
    display_welcome()
    
    try:
        generator = MemeGeneratorClean()
        print("✅ Meme generator initialized successfully!")
        
        while True:
            display_categories()
            choice, category_data = get_user_choice()
            
            if not choice:  # User pressed Ctrl+C
                break
                
            topic, context = get_topic_from_category(category_data)
            if not topic:
                continue
                
            print(f"\n🎨 Generating meme for: '{topic}'")
            if context:
                print(f"📝 Context: {context}")
            
            print("\n⏳ Creating your meme... (this may take a few seconds)")
            
            filename = generator.create_meme(topic, context)
            
            if filename:
                print("\n🎉 SUCCESS! Your meme has been generated!")
                print(f"📁 Saved as: {filename}")
                print("✨ Check the 'memes' folder to view your creation!")
            else:
                print("\n❌ Oops! Failed to generate meme. Please try again.")
            
            # Ask if user wants to generate another meme
            try:
                another = input("\n🔄 Generate another meme? (y/n): ").strip().lower()
                if another not in ['y', 'yes']:
                    break
            except KeyboardInterrupt:
                break
                
        print("\n👋 Thanks for using the Dynamic Meme Generator!")
        print("🎭 Keep creating and sharing awesome memes!")
        
    except Exception as e:
        print(f"\n❌ Error initializing meme generator: {e}")
        print("Please check your environment setup and try again.")

if __name__ == "__main__":
    generate_meme_interactive()