import os
import requests
from PIL import Image, ImageDraw, ImageFont
import random
from io import BytesIO
from datetime import datetime
from groq import Groq
from dotenv import load_dotenv

class MemeGeneratorClean:
    """
    A clean meme generator class focused only on meme creation without social media posting.
    
    This class combines AI-generated text with meme templates to create custom memes.
    It supports Hinglish text generation and handles image processing with proper text
    placement and styling.
    """

    def __init__(self):
        """
        Initialize the MemeGenerator with necessary configurations and API clients.
        Sets up directories, fonts, and API connections.
        """
        self._setup_directories()
        self._initialize_environment()
        
    def _initialize_environment(self):
        """Initialize environment and check for required dependencies."""
        # Load environment variables
        load_dotenv()
        
        # Initialize Groq client
        self.groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        
        # Check for font files
        font_found = False
        
        # Check if fonts directory exists
        if os.path.exists(self.fonts_dir):
            # Check for any font files
            font_files = [f for f in os.listdir(self.fonts_dir) if f.endswith(('.ttf', '.otf'))]
            if font_files:
                font_found = True
                # Set the font path to the first available font
                self.font_path = os.path.join(self.fonts_dir, font_files[0])
                print(f"Found font: {self.font_path}")
        
        # Try to download font if not found
        if not font_found:
            print("Downloading font file...")
            if self._download_font():
                font_found = True
            else:
                print("Failed to download font: HTTP Error 404: Not Found")
        
        if not font_found:
            raise FileNotFoundError(
                f"No suitable font found. Please download DejaVuSans-Bold.ttf to the fonts/ directory."
            )

    def _download_font(self):
        """Download DejaVu font if not available."""
        try:
            import urllib.request
            # Use a reliable font source
            font_url = "https://github.com/google/fonts/raw/main/apache/opensans/OpenSans%5Bwdth,wght%5D.ttf"
            font_dir = "fonts"
            os.makedirs(font_dir, exist_ok=True)
            self.font_path = os.path.join(font_dir, "OpenSans-Bold.ttf")
            
            print("Downloading font file...")
            urllib.request.urlretrieve(font_url, self.font_path)
            print(f"Font downloaded to {self.font_path}")
            return True
        except Exception as e:
            print(f"Failed to download font: {e}")
            return False

    def _setup_directories(self):
        """Create necessary directories for storing generated memes."""
        self.output_dir = "memes"
        self.fonts_dir = "fonts"
        os.makedirs(self.output_dir, exist_ok=True)
        os.makedirs(self.fonts_dir, exist_ok=True)

    def get_meme_template(self):
        """
        Fetch a random meme template from the Imgflip API.
        
        Returns:
            tuple: (template_url, width, height) or (None, None, None) if failed
        """
        try:
            response = requests.get("https://api.imgflip.com/get_memes")
            response.raise_for_status()
            memes = response.json().get('data', {}).get('memes', [])

            if not memes:
                print("No meme templates found.")
                return None, None, None

            # Keep selecting templates until we find one in landscape orientation
            while True:
                template = random.choice(memes)
                width, height = template['width'], template['height']
                
                # Check for landscape orientation (width significantly larger than height)
                if width >= height:
                    return template['url'], width, height
                
        except requests.RequestException as e:
            print(f"Failed to fetch meme template: {e}")
            return None, None, None

    def generate_meme_text(self, topic, custom_context=None):
        """
        Generate two lines of Hinglish meme text using Groq API with enhanced humor.
        
        Args:
            topic (str): The topic to base the meme on
            custom_context (str, optional): Additional context for the meme
            
        Returns:
            tuple: (top_text, bottom_text)
        """
        try:
            # Create enhanced prompts for funnier, roasting-style Hinglish memes
            if custom_context:
                prompt = f"""
                    You are a Gen Z Indian meme creator who creates SAVAGE and HILARIOUS Hinglish memes that go VIRAL. 
                    Create a TWO-LINE meme about "{topic}" in the context of "{custom_context}".
                    
                    STYLE REQUIREMENTS:
                    - Use HINGLISH (Hindi + English mix) like real Gen Z Indians speak
                    - Be ROASTING and SAVAGE but relatable
                    - Include popular Gen Z slang: "bro", "yaar", "bestie", "fr fr", "no cap", "periodt", "sus", "vibe"
                    - Use Indian expressions: "bas kar bhai", "kya bakwas", "are yaar", "sach mein", "bilkul", "matlab", "kaise"
                    - Make it FUNNY and SHAREABLE - something that would get 1000+ likes
                    - Reference current trends, social media culture, or relatable struggles
                    - Be witty with wordplay, puns, or clever observations
                    
                    HUMOR STYLE: Roasting, sarcastic, relatable, Gen Z energy
                    FORMAT: Two lines only, no quotes, no labels
                    
                    Example style: "Bro said healthy khana khaunga" / "Phir Maggi midnight mein order kar diya"
                """
            else:
                prompt = f"""
                    You are a Gen Z Indian meme creator who creates SAVAGE and HILARIOUS Hinglish memes that go VIRAL.
                    Create a TWO-LINE roasting meme about "{topic}".
                    
                    STYLE REQUIREMENTS:
                    - Use HINGLISH (Hindi + English mix) like real Gen Z Indians speak
                    - Be ROASTING and SAVAGE but relatable and funny
                    - Include Gen Z slang: "bro", "yaar", "bestie", "fr fr", "no cap", "periodt", "sus", "vibe", "slay"
                    - Use Indian expressions: "bas kar bhai", "kya bakwas", "are yaar", "sach mein", "bilkul", "matlab"
                    - Reference social media culture, modern struggles, or trending topics
                    - Make it VIRAL-worthy - something Gen Z would share instantly
                    - Be witty, sarcastic, and use clever observations
                    - Include modern references: Instagram, reels, dating apps, online classes, work from home
                    
                    HUMOR STYLE: Roasting, sarcastic, relatable, peak Gen Z energy
                    FORMAT: Two lines only, no quotes, no labels, pure meme text
                    
                    Example styles:
                    - "Me: Mom I'm an adult now" / "Also me: Mummy paani dedo"
                    - "LinkedIn pe Professional hun" / "WhatsApp status pe Philosopher"
                    - "Bro said 5 min mein ready ho jaunga" / "Phir 2 ghante baad online aaya"
                """
            
            response = self.groq_client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama-3.3-70b-versatile",
                temperature=0.7,
                max_tokens=100,
            )
            
            text = response.choices[0].message.content.strip()
            return self._process_generated_text(text)
            
        except Exception as e:
            print(f"Error generating meme text: {e}")
            return "Error generating meme text.", "Please try again."

    def _process_generated_text(self, text):
        """
        Process the generated text into two lines.
        
        Args:
            text (str): Raw generated text
            
        Returns:
            tuple: (top_text, bottom_text)
        """
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        
        if len(lines) != 2:
            if len(lines) == 1:
                text = lines[0]
                # Try splitting on punctuation
                for separator in ['. ', '? ', '! ', '| ']:
                    if separator in text:
                        parts = text.split(separator, 1)
                        return parts[0].strip(), parts[1].strip()
                
                # If no punctuation, split at midpoint
                words = text.split()
                mid = len(words) // 2
                return ' '.join(words[:mid]), ' '.join(words[mid:])
        
        return lines[0], lines[1] if len(lines) > 1 else "Please try again"

    def _calculate_font_size(self, img, text, max_width_ratio=0.80):
        """
        Calculate the optimal font size for the given text and image dimensions.
        
        Args:
            img: PIL Image object
            text (str): Text to be rendered
            max_width_ratio (float): Maximum width ratio for text
            
        Returns:
            int: Optimal font size
        """
        initial_size = int(img.height * 0.12)
        min_size = int(img.height * 0.06)
        max_size = int(img.height * 0.15)
        
        font_size = min(initial_size, max_size)
        
        while font_size > min_size:
            try:
                font = ImageFont.truetype(self.font_path, font_size)
                if font.getlength(text) <= (img.width * max_width_ratio):
                    break
            except Exception as e:
                print(f"Error loading font: {e}")
                raise FileNotFoundError("Cannot load font for meme generation")
            font_size -= 2
            
        return max(font_size, min_size)

    def _wrap_text(self, text, font, max_width):
        """
        Wrap text to fit within the specified width.
        
        Args:
            text (str): Text to wrap
            font: PIL ImageFont object
            max_width (int): Maximum width in pixels
            
        Returns:
            list: Lines of wrapped text
        """
        words = text.split()
        lines = []
        current_line = []
        
        for word in words:
            current_line.append(word)
            line_width = font.getlength(' '.join(current_line))
            
            if line_width > max_width:
                if len(current_line) == 1:
                    lines.append(current_line[0])
                    current_line = []
                else:
                    current_line.pop()
                    lines.append(' '.join(current_line))
                    current_line = [word]
                    
        if current_line:
            lines.append(' '.join(current_line))
            
        return lines

    def _draw_text_with_outline(self, draw, text, x, y, font, stroke_width):
        """
        Draw text with outline effect.
        
        Args:
            draw: PIL ImageDraw object
            text (str): Text to draw
            x, y (int): Coordinates for text placement
            font: PIL ImageFont object
            stroke_width (int): Width of the outline
        """
        # Draw outline
        offsets = [(1, 1), (-1, -1), (1, -1), (-1, 1)]
        for offset_x, offset_y in offsets:
            draw.text(
                (x + offset_x, y + offset_y),
                text,
                font=font,
                fill="black"
            )
        
        # Draw main text
        draw.text(
            (x, y),
            text,
            font=font,
            fill="white",
            stroke_width=stroke_width,
            stroke_fill="black"
        )

    def create_meme(self, topic, custom_context=None):
        """
        Create a meme by combining template and generated text.
        
        Args:
            topic (str): Topic for the meme
            custom_context (str, optional): Additional context for the meme
            
        Returns:
            dict: Contains success status, filename/error message, and metadata
        """
        template_url, width, height = self.get_meme_template()
        if not template_url:
            return {
                "success": False,
                "error": "Failed to fetch meme template",
                "filename": None
            }

        try:
            # Load and prepare image
            response = requests.get(template_url)
            response.raise_for_status()
            img = Image.open(BytesIO(response.content))
            
            # Ensure minimum image size
            min_size = 800
            if img.width < min_size or img.height < min_size:
                ratio = max(min_size / img.width, min_size / img.height)
                new_size = (int(img.width * ratio), int(img.height * ratio))
                img = img.resize(new_size, Image.Resampling.LANCZOS)

            # Generate text and prepare drawing
            top_text, bottom_text = self.generate_meme_text(topic, custom_context)
            draw = ImageDraw.Draw(img)
            
            # Calculate text parameters
            longest_text = max(top_text, bottom_text, key=len)
            font_size = self._calculate_font_size(img, longest_text)
            
            # Create font object
            try:
                font = ImageFont.truetype(self.font_path, font_size)
            except Exception as e:
                print(f"Error loading font: {e}")
                raise FileNotFoundError("Cannot load font for meme generation")
            
            # Calculate layout parameters
            margin = int(img.height * 0.06)
            max_text_width = img.width - (2 * margin)
            line_height = int(font_size * 1.3)
            stroke_width = max(2, int(font_size * 0.04))

            # Draw top text
            y_position = margin
            for line in self._wrap_text(top_text, font, max_text_width):
                x_position = (img.width - font.getlength(line)) // 2
                self._draw_text_with_outline(draw, line, x_position, y_position, font, stroke_width)
                y_position += line_height

            # Draw bottom text
            bottom_lines = self._wrap_text(bottom_text, font, max_text_width)
            y_position = img.height - margin - (len(bottom_lines) * line_height)
            for line in bottom_lines:
                x_position = (img.width - font.getlength(line)) // 2
                self._draw_text_with_outline(draw, line, x_position, y_position, font, stroke_width)
                y_position += line_height

            # Save the meme
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{self.output_dir}/meme_{topic.split()[0].replace(' ', '_')}_{timestamp}.png"
            img.save(filename)
            
            return {
                "success": True,
                "filename": filename,
                "top_text": top_text,
                "bottom_text": bottom_text,
                "topic": topic,
                "context": custom_context,
                "timestamp": timestamp
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "filename": None
            }

    def get_topic_categories(self):
        """Get predefined topic categories for the frontend."""
        return {
            "youth": {
                "name": "Youth & Gen Z Issues",
                "examples": [
                    "Gen Z job interview expectations vs reality",
                    "Social media addiction among youth",
                    "Online classes vs offline experience",
                    "Gig economy and side hustles struggle",
                    "Mental health awareness in young generation"
                ]
            },
            "world": {
                "name": "World Current Events",
                "examples": [
                    "AI taking over jobs but can't cook like mom",
                    "Climate change activists vs daily lifestyle",
                    "Cryptocurrency investment vs traditional savings",
                    "Remote work culture post-pandemic",
                    "Social media influencing real-world events"
                ]
            },
            "culture": {
                "name": "Indian Society & Culture",
                "examples": [
                    "Traditional Indian parents vs modern kids",
                    "Festival celebrations in metro cities vs villages",
                    "Arranged marriage in digital age",
                    "Regional language vs English preference",
                    "Indian food culture vs fast food adoption"
                ]
            },
            "tech": {
                "name": "Technology & AI",
                "examples": [
                    "ChatGPT helping with homework",
                    "Instagram reality vs actual life",
                    "Online shopping vs physical store experience",
                    "Smartphone addiction and real conversations",
                    "Video call meetings and technical difficulties"
                ]
            },
            "relationships": {
                "name": "Relationships & Dating",
                "examples": [
                    "Modern dating apps vs traditional meetings",
                    "Long distance relationships in digital age",
                    "Social media affecting real relationships",
                    "Friendship in online vs offline world",
                    "Dating expectations vs reality in 2024"
                ]
            },
            "career": {
                "name": "Education & Career",
                "examples": [
                    "College placement season stress",
                    "Skill development vs degree importance",
                    "Internship expectations vs reality",
                    "Work from home vs office culture",
                    "Student loan burden and career choices"
                ]
            },
            "finance": {
                "name": "Finance & Economy",
                "examples": [
                    "Salary expectations vs actual paycheck",
                    "Inflation affecting daily life choices",
                    "Investment advice vs actual market reality",
                    "EMI culture and financial planning",
                    "Savings goals vs online shopping temptations"
                ]
            },
            "lifestyle": {
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