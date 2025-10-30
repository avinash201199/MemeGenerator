// Development server to handle API calls locally
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Caption API endpoint - same logic as api/caption.js
app.post('/api/caption', async (req, res) => {
  try {
    const { template_id, boxes = [], username, password } = req.body || {};

    if (!template_id) {
      return res.status(400).json({ success: false, error: 'template_id is required' });
    }

    const user = username || process.env.IMGFLIP_USERNAME;
    const pass = password || process.env.IMGFLIP_PASSWORD;

    // Demo mode - if no credentials or demo credentials, return a mock response
    if (!user || !pass || user === 'demo_user' || user === 'your_imgflip_username_here') {
      console.log('Demo mode: returning mock meme response');
      
      // Create a demo response with a placeholder image that shows the text
      const demoText = boxes.map(box => box.text || '').join(' / ');
      const encodedText = encodeURIComponent(`Demo Meme: ${demoText}`);
      
      return res.status(200).json({ 
        success: true, 
        data: { 
          url: `https://via.placeholder.com/400x400/FF6B6B/FFFFFF?text=${encodedText}`,
          page_url: 'https://imgflip.com/demo'
        }
      });
    }

    const params = new URLSearchParams();
    params.append('template_id', String(template_id));
    params.append('username', user);
    params.append('password', pass);

    (boxes || []).forEach((box, i) => {
      const val = box && typeof box.text === 'string' ? box.text : '';
      params.append(`boxes[${i}][text]`, val);
    });

    const resp = await fetch('https://api.imgflip.com/caption_image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const data = await resp.json();

    // Normalize response
    if (data && data.success) {
      return res.status(200).json({ success: true, data: data.data });
    }

    return res.status(400).json({ success: false, error: data?.error_message || 'Imgflip error' });
  } catch (err) {
    console.error('caption proxy error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Development API server running on http://localhost:${PORT}`);
  console.log('Make sure your .env.local file has IMGFLIP_USERNAME and IMGFLIP_PASSWORD set');
});