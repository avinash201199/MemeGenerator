from flask import Flask, request, jsonify, send_file, render_template
from flask_cors import CORS
import os
import json
from meme_generator_clean import MemeGeneratorClean
import random
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize the meme generator
meme_generator = None

def initialize_generator():
    """Initialize the meme generator with error handling."""
    global meme_generator
    try:
        meme_generator = MemeGeneratorClean()
        return True
    except Exception as e:
        print(f"Error initializing meme generator: {e}")
        return False

@app.route('/')
def index():
    """Serve the main web interface."""
    return render_template('index.html')

@app.route('/api/categories', methods=['GET'])
def get_categories():
    """Get all available topic categories."""
    try:
        if not meme_generator:
            if not initialize_generator():
                return jsonify({"error": "Failed to initialize meme generator"}), 500
        
        categories = meme_generator.get_topic_categories()
        return jsonify({"success": True, "categories": categories})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/generate', methods=['POST'])
def generate_meme():
    """Generate a meme based on user input."""
    try:
        if not meme_generator:
            if not initialize_generator():
                return jsonify({"error": "Failed to initialize meme generator"}), 500
        
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        topic = data.get('topic', '').strip()
        context = data.get('context', '').strip()
        custom_top_text = data.get('custom_top_text', '').strip()
        custom_bottom_text = data.get('custom_bottom_text', '').strip()
        template_url = data.get('template_url', '').strip()
        template_id = data.get('template_id', '').strip()
        
        if not topic and not (custom_top_text and custom_bottom_text):
            return jsonify({"error": "Topic is required or both custom texts must be provided"}), 400
        
        # Generate the meme
        if custom_top_text and custom_bottom_text:
            # Use custom text provided by user
            result = meme_generator.create_meme_with_custom_text(
                topic if topic else "Custom Meme", 
                custom_top_text, 
                custom_bottom_text,
                context,
                template_url if template_url else None,
                template_id if template_id else None
            )
        else:
            # Generate text using AI
            result = meme_generator.create_meme(topic, context if context else None)
        
        if result['success']:
            # Return success response with meme info
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
    """Generate a random meme from predefined topics."""
    try:
        if not meme_generator:
            if not initialize_generator():
                return jsonify({"error": "Failed to initialize meme generator"}), 500
        
        # Get random topic from categories
        categories = meme_generator.get_topic_categories()
        random_category_key = random.choice(list(categories.keys()))
        random_category = categories[random_category_key]
        random_topic = random.choice(random_category['examples'])
        
        # Generate the meme
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
    """Download a generated meme."""
    try:
        # Security check: only allow downloading from memes directory
        safe_filename = os.path.basename(filename)
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
    """View a generated meme."""
    try:
        # Security check: only allow viewing from memes directory
        safe_filename = os.path.basename(filename)
        file_path = os.path.join('memes', safe_filename)
        
        if not os.path.exists(file_path):
            return jsonify({"error": "File not found"}), 404
        
        return send_file(file_path, mimetype='image/png')
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
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

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    # Initialize the meme generator on startup
    print(" Starting Meme Generator Web App...")
    
    if initialize_generator():
        print(" Meme generator initialized successfully!")
    else:
        print(" Failed to initialize meme generator. Check your environment setup.")
    
    print(" Starting Flask server...")
    print(" Open your browser and go to: http://localhost:5000")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
