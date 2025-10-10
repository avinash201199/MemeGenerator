from PIL import Image, ImageDraw, ImageFont
import textwrap
import os

class MemeGenerator:
    def __init__(self, output_dir="memes"):
        """
        Initialize the MemeGenerator.
        :param output_dir: directory where generated memes are saved
        """
        self.output_dir = output_dir
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

    def create_meme(self, image_path, top_text="", bottom_text="", font_path=None, font_size=40):
        """
        Create a meme with top and bottom text.
        :param image_path: path to the base image
        :param top_text: text at the top of the meme
        :param bottom_text: text at the bottom of the meme
        :param font_path: path to .ttf font file
        :param font_size: size of the font
        :return: path of the generated meme image
        """
        # Open the image
        img = Image.open(image_path)
        draw = ImageDraw.Draw(img)
        image_width, image_height = img.size

        # Load default font if none provided
        if not font_path:
            font_path = "arial.ttf"  # Windows default
        try:
            font = ImageFont.truetype(font_path, font_size)
        except:
            font = ImageFont.load_default()
            print("Warning: Default font loaded. Custom font not found.")

        # Function to draw text with wrapping
        def draw_text(text, position):
            lines = textwrap.wrap(text, width=20)
            y_text = position
            for line in lines:
                line_width, line_height = font.getsize(line)
                x_text = (image_width - line_width) / 2  # Center align
                draw.text((x_text, y_text), line, font=font, fill="white", stroke_fill="black", stroke_width=2)
                y_text += line_height

        # Draw top and bottom text
        if top_text:
            draw_text(top_text.upper(), 10)
        if bottom_text:
            draw_text(bottom_text.upper(), image_height - 100)

        # Save the meme
        output_path = os.path.join(self.output_dir, f"meme_{len(os.listdir(self.output_dir))+1}.png")
        img.save(output_path)
        return output_path

# -------------------------
# Example usage
# -------------------------
if __name__ == "__main__":
    meme_gen = MemeGenerator()

    meme_path = meme_gen.create_meme(
        image_path="example.jpg",  # Replace with your image path
        top_text="When you try to code",
        bottom_text="But StackOverflow fails you",
        font_size=50
    )

    print(f"Meme saved at: {meme_path}")
