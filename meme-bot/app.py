from flask import Flask, request, jsonify, send_file, render_template
from flask_cors import CORS
import os
import json
from meme_generator_clean import MemeGeneratorClean
import random
from datetime import datetime

# -----------------------------
# Initialize Flask application
# -----------------------------
app = Flask(__name__)

# Enable Cross-Origin Resource Sharing (CORS) for all routes.
# This allows your frontend (running on another domain/port) to call these APIs.
CORS(app)  

# -----------------------------
# Global Meme Generator
# -----------------------------
meme_generator = None  # Will hold an instance of MemeGeneratorClean

def initialize_generator():
    """
    Initialize the meme generator with error handling.
    Returns True if initialization succeeds, False otherwise.
    """
    global meme_generator
    try:
        meme_generator = MemeGeneratorClean()  # Create meme generator instance
        return True
    except Exception as e:
        # Print error to console (helps debugging initialization issues)
        print(f"Error initializing meme generator: {e}")
        return False

# -----------------------------
# Routes
# -----------------------------

@app.route('/')
def index():
    """
    Serve the main web interface.
    Renders index.html from the templates folder.
    """
    return render_template('index.html')

@app.route('/api/categories', methods=['GET'])
def get_categories():
    """
    API endpoint to get all available meme topic categories.
    Returns a JSON object containing categories or an error message.
    """
    try:
        # Ensure meme generator is initialized
        if not meme_generator:
            if not initialize_generator():
                return jsonify({"error": "Failed to initialize meme generator"}), 500
        
        categories = meme_generator.get_topic_categories()
        return jsonify({"success": True, "categories": categories})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/generate', methods=['POST'])
def generate_meme():
    """
    API endpoint to generate a meme based on user input.
    Request JSON should include:
    - topic (str): meme topic
    - context (str, optional): extra context for AI text generation
    - custom_top_text, custom_bottom_text (str, optional): user-defined meme texts
    - template_url, template_id (str, optional): custom meme template
    """
    try:
        # Ensure meme generator is initialized
        if not meme_generator:
            if not initialize_generator():
                return jsonify({"error": "Failed to initialize meme generator"}), 500
        
        data = request.get_json()  # Parse JSON body
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        # Extract input parameters
        topic = data.get('topic', '').strip()
        context = data.get('context', '').strip()
        custom_top_text = data.get('custom_top_text', '').strip()
        custom_bottom_text = data.get('custom_bottom_text', '').strip()
        template_url = data.get('template_url', '').strip()
        template_id = data.get('template_id', '').strip()
        
        # Require either a topic or both custom texts
        if not topic and not (custom_top_text and custom_bottom_text):
            return jsonify({"error": "Topic is required or both custom texts must be provided"}), 400
        
        # Generate meme
        if custom_top_text and custom_bottom_text:
            # Use user-provided custom text
            result = meme_generator.create_meme_with_custom_text(
                topic if topic else "Custom Meme",  # fallback topic
                custom_top_text,
                custom_bottom_text,
                context,
                template_url if template_url else None,
                template_id if template_id else None
            )
        else:
            # Use AI to generate meme text
            result = meme_generator.create_meme(topic, context if context else None)
        
        if result['success']:
            # Successful response with meme details
            return jsonify({
                "success": True,
                "filename": os.path.basename(result['filename']),
                "filepath": result['filename'],
                "top_text": result['top_text'],
                "bottom_text": result['bottom_text'],
                "topic": result['topic'],
                "context": result.get('context'),
                "timestamp": result['timestamp']
            })
        else:
            return jsonify({
                "success": False,
                "error": result['error']
            }), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/random', methods=['POST'])
def generate_random_meme():
    """
    API endpoint to generate a random meme from predefined topics.
    Randomly selects a category and topic to generate the meme.
    """
    try:
        # Ensure meme generator is initialized
        if not meme_generator:
            if not initialize_generator():
                return jsonify({"error": "Failed to initialize meme generator"}), 500
        
        # Get categories and select random topic
        categories = meme_generator.get_topic_categories()
        random_category_key = random.choice(list(categories.keys()))
        random_category = categories[random_category_key]
        random_topic = random.choice(random_category['examples'])
        
        # Generate meme
        result = meme_generator.create_meme(random_topic, random_category['name'].lower())
        
        if result['success']:
            return jsonify({
                "success": True,
                "filename": os.path.basename(result['filename']),
                "filepath": result['filename'],
                "top_text": result['top_text'],
                "bottom_text": result['bottom_text'],
                "topic": result['topic'],
                "context": result.get('context'),
                "timestamp": result['timestamp'],
                "category": random_category['name']
            })
        else:
            return jsonify({
                "success": False,
                "error": result['error']
            }), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/download/<filename>')
def download_meme(filename):
    """
    API endpoint to download a generated meme as an image file.
    Security check ensures only files from the 'memes' directory are accessed.
    """
    try:
        safe_filename = os.path.basename(filename)  # prevent directory traversal
        file_path = os.path.join('memes', safe_filename)
        
        if not os.path.exists(file_path):
            return jsonify({"error": "File not found"}), 404
        
        return send_file(
            file_path,
            as_attachment=True,
            download_name=safe_filename,
            mimetype='image/png'
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/view/<filename>')
def view_meme(filename):
    """
    API endpoint to view a generated meme directly in the browser.
    Security check ensures only files from the 'memes' directory are accessed.
    """
    try:
        safe_filename = os.path.basename(filename)  # prevent directory traversal
        file_path = os.path.join('memes', safe_filename)
        
        if not os.path.exists(file_path):
            return jsonify({"error": "File not found"}), 404
        
        return send_file(file_path, mimetype='image/png')
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Health check endpoint to verify the server and meme generator status.
    Useful for monitoring or automated uptime checks.
    """
    try:
        if not meme_generator:
            if not initialize_generator():
                return jsonify({
                    "status": "unhealthy",
                    "error": "Meme generator not initialized"
                }), 500
        
        return jsonify({
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "generator_ready": meme_generator is not None
        })
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "error": str(e)
        }), 500

# -----------------------------
# Error Handlers
# -----------------------------

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors for undefined endpoints."""
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors for server exceptions."""
    return jsonify({"error": "Internal server error"}), 500

# -----------------------------
# App Entry Point
# -----------------------------
if __name__ == '__main__':
    # Print startup messages
    print("🚀 Starting Meme Generator Web App...")
    
    if initialize_generator():
        print("✅ Meme generator initialized successfully!")
    else:
        print("❌ Failed to initialize meme generator. Check your environment setup.")
    
    print("🌐 Starting Flask server...")
    print("📱 Open your browser and go to: http://localhost:5000")
    
    # Start Flask server
    app.run(debug=True, host='0.0.0.0', port=5000)
