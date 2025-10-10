// Vercel Serverless Function: Proxy Imgflip caption_image securely
// Expects POST JSON: { template_id: string, boxes: Array<{ text: string }>, username?: string, password?: string }
// Uses env vars IMGFLIP_USERNAME and IMGFLIP_PASSWORD by default.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { template_id, boxes = [], username, password } = req.body || {};

    if (!template_id) {
      return res.status(400).json({ success: false, error: 'template_id is required' });
    }

    const user = username || process.env.IMGFLIP_USERNAME;
    const pass = password || process.env.IMGFLIP_PASSWORD;

    if (!user || !pass) {
      return res.status(500).json({ success: false, error: 'Server not configured: missing IMGFLIP credentials' });
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
}
