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
                    You are a next-gen meme creator. Your task is to create a funny Hinglish meme with a PREMISE and a witty PUNCHLINE about "{topic}" in the context of "{custom_context}".
                    - Use Hinglish (mix of Hindi + English).  
                    - Make it witty, sarcastic, and clever (avoid basic normie jokes).  
                    - Use wordplay, double meaning, or relatable Gen-Z humor.  
                    - Structure: 
                       1. Premise (setup situation, relatable or exaggerated)  
                       2. Punchline (twist, witty comeback, or funny irony)  
                       3. Final meme caption (short & punchy).  

                    Example format:  
                    Premise: "Exam hall me sab log serious baithe hai"  
                    Punchline: "Aur main ekdum CID waale Tarika se dekh raha hu—'kuch toh gadbad hai'"  
                    Caption: "POV: Tumhare 2 number bhi nikal jaaye toh miracle hai 😂"
                    
                    Create a similar meme about "{topic}" in "{custom_context}" context.
                """
            else:
                prompt = f"""
                    You are a next-gen meme creator. Your task is to create a funny Hinglish meme with a PREMISE and a witty PUNCHLINE about "{topic}".
                    - Use Hinglish (mix of Hindi + English).  
                    - Make it witty, sarcastic, and clever (avoid basic normie jokes).  
                    - Use wordplay, double meaning, or relatable Gen-Z humor.  
                    - Structure: 
                       1. Premise (setup situation, relatable or exaggerated)  
                       2. Punchline (twist, witty comeback, or funny irony)  
                       3. Final meme caption (short & punchy).  

                    Example format:  
                    Premise: "Exam hall me sab log serious baithe hai"  
                    Punchline: "Aur main ekdum CID waale Tarika se dekh raha hu—'kuch toh gadbad hai'"  
                    Caption: "POV: Tumhare 2 number bhi nikal jaaye toh miracle hai 😂"
                    
                    Create a similar meme about "{topic}".
                """
            
            response = self.groq_client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama-3.3-70b-versatile",
                temperature=0.7,  # Back to stable value for consistent quality
                max_tokens=150,   # Increased for premise, punchline, and caption
            )
            
            text = response.choices[0].message.content.strip()
            return self._process_generated_text(text)
            
        except Exception as e:
            print(f"Error generating meme text: {e}")
            return "Error generating meme text.", "Please try again."

    def _process_generated_text(self, text):
        """
        Process the generated text into two lines for the meme.
        
        Args:
            text (str): Raw generated text with Premise, Punchline, and Caption
            
        Returns:
            tuple: (top_text, bottom_text)
        """
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        
        # Look for premise and punchline in the response
        premise = ""
        punchline = ""
        
        for line in lines:
            # Remove common prefixes
            line = line.replace("Premise:", "").replace("Punchline:", "").replace("Caption:", "").strip()
            line = line.replace("1.", "").replace("2.", "").replace("3.", "").strip()
            
            if not premise and line:
                premise = line
            elif not punchline and line and line != premise:
                punchline = line
                break
        
        # If we couldn't parse properly, try alternative approach
        if not premise or not punchline:
            # Try splitting on common patterns
            for separator in ['. ', '? ', '! ', '" ', '" ']:
                if separator in text:
                    parts = text.split(separator, 1)
                    if len(parts) >= 2:
                        premise = parts[0].strip().replace("Premise:", "").replace("1.", "").strip()
                        punchline = parts[1].split('.')[0].strip().replace("Punchline:", "").replace("2.", "").strip()
                        break
        
        # Final fallback - use first two meaningful lines
        if not premise or not punchline:
            meaningful_lines = []
            for line in lines:
                clean_line = line.replace("Premise:", "").replace("Punchline:", "").replace("Caption:", "")
                clean_line = clean_line.replace("1.", "").replace("2.", "").replace("3.", "").strip()
                if clean_line and len(clean_line) > 5:  # Ignore very short lines
                    meaningful_lines.append(clean_line)
            
            if len(meaningful_lines) >= 2:
                premise = meaningful_lines[0]
                punchline = meaningful_lines[1]
            elif len(meaningful_lines) == 1:
                # Split the single line if it's too long
                words = meaningful_lines[0].split()
                mid = len(words) // 2
                premise = ' '.join(words[:mid])
                punchline = ' '.join(words[mid:])
        
        # Clean up any remaining unwanted text
        premise = premise.replace('"', '').replace('"', '').replace('"', '').strip()
        punchline = punchline.replace('"', '').replace('"', '').replace('"', '').strip()
        
        # Ensure we have something
        if not premise:
            premise = "Meme generation error"
        if not punchline:
            punchline = "Please try again"
            
        return premise, punchline

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

    def create_meme_with_custom_text(self, topic, top_text, bottom_text, custom_context=None, template_url=None, template_id=None):
        """
        Create a meme with custom user-provided text.
        
        Args:
            topic (str): Topic for the meme (used for filename)
            top_text (str): Custom top text for the meme
            bottom_text (str): Custom bottom text for the meme
            custom_context (str, optional): Additional context
            template_url (str, optional): Specific template URL to use
            template_id (str, optional): Specific template ID to use
            
        Returns:
            dict: Contains success status, filename/error message, and metadata
        """
        # Use existing template if provided, otherwise get a new one
        if template_url:
            try:
                response = requests.get(template_url)
                response.raise_for_status()
                img = Image.open(BytesIO(response.content))
                width, height = img.size
            except Exception as e:
                print(f"Error loading existing template: {e}")
                # Fallback to getting a new template
                template_url, width, height = self.get_meme_template()
                if not template_url:
                    return {
                        "success": False,
                        "error": "Failed to fetch meme template",
                        "filename": None
                    }
        else:
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

            # Prepare drawing with custom text
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
                "name": "Youth & Gen Z Roasts",
                "examples": [
                    "LinkedIn influencers posting cringe motivation",
                    "People who post gym selfies but never work out",
                    "Instagram vs reality of college life",
                    "Dating app conversations that go nowhere", 
                    "Kids who think they're entrepreneurs at 19"
                ]
            },
            "social_media": {
                "name": "Social Media Hypocrisy",
                "examples": [
                    "People who post mental health awareness then judge others",
                    "Instagram influencers promoting toxic positivity",
                    "LinkedIn posts that are clearly fake stories",
                    "People who ghost you but watch all your stories",
                    "Couples who post love quotes before breakup"
                ]
            },
            "work": {
                "name": "Corporate & Work Life",
                "examples": [
                    "HR posting work-life balance while scheduling weekend meetings",
                    "Companies calling employees family then firing during recession",
                    "Bosses who reply to emails at 11 PM expecting immediate response",
                    "Job descriptions requiring 5 years experience for entry level",
                    "People who pretend to be busy in office but scroll Instagram"
                ]
            },
            "relationships": {
                "name": "Modern Dating & Relationships", 
                "examples": [
                    "People who say they want genuine connection but judge by followers",
                    "Dating app bios that say looking for something serious",
                    "Couples who break up over text after 2 year relationship",
                    "People who play hard to get then complain about being single",
                    "Guys who call themselves sigma males but live with parents"
                ]
            },
            "lifestyle": {
                "name": "Lifestyle & Habits",
                "examples": [
                    "People who buy expensive skincare but sleep at 3 AM",
                    "Fitness influencers promoting unhealthy diet culture",
                    "People who preach minimalism but buy everything on sale",
                    "Health freaks who drink protein shakes but smoke cigarettes",
                    "People who budget for investment but spend on Starbucks daily"
                ]
            },
            "family": {
                "name": "Desi Family Drama",
                "examples": [
                    "Parents who say money doesn't matter then ask about salary",
                    "Relatives who judge your career choices but ask for favors",
                    "Family WhatsApp groups spreading fake news",
                    "Aunties who give relationship advice but have toxic marriages",
                    "Parents who want independent kids but control everything"
                ]
            },
            "education": {
                "name": "Education System Roasts",
                "examples": [
                    "Teachers who say marks don't matter then rank students",
                    "Colleges promoting practical learning with theoretical exams",
                    "Online classes where only teacher talks to themselves",
                    "Students who complain about exams but never study",
                    "Engineering colleges promising 100% placement with 30% salary"
                ]
            },
            "trends": {
                "name": "Current Trends & Viral Culture",
                "examples": [
                    "Crypto bros who lost money but still give financial advice",
                    "People who jump on every viral trend for attention",
                    "NFT enthusiasts explaining digital ownership to confused parents",
                    "Instagram reels copying exact same TikTok trends",
                    "People who become experts after watching one YouTube video"
                ]
            }
        }