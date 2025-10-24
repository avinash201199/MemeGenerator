// Vercel Serverless Function: Proxy Imgflip caption_image securely with compression support
// Expects POST JSON: { template_id: string, boxes: Array<{ text: string }>, username?: string, password?: string, compressionQuality?: string, format?: string }
// Uses env vars IMGFLIP_USERNAME and IMGFLIP_PASSWORD by default.

/**
 * Calculate estimated file size based on quality level
 * These are estimates for typical meme images
 */
function getEstimatedCompression(quality) {
  const estimates = {
    high: { ratio: 0.7, label: 'High Quality' },
    medium: { ratio: 0.5, label: 'Balanced' },
    low: { ratio: 0.3, label: 'Optimized' }
  };
  return estimates[quality] || estimates.medium;
}

/**
 * Get quality parameter for different formats
 */
function getQualityParams(format, quality) {
  const qualityMap = {
    high: { jpeg: 85, webp: 85 },
    medium: { jpeg: 75, webp: 75 },
    low: { jpeg: 60, webp: 60 }
  };
  
  const qualities = qualityMap[quality] || qualityMap.medium;
  return format === 'webp' ? qualities.webp : qualities.jpeg;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { 
      template_id, 
      boxes = [], 
      username, 
      password,
      compressionQuality = 'medium',
      format = 'jpeg'
    } = req.body || {};

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

    // Normalize response and add compression info
    if (data && data.success) {
      const quality = getQualityParams(format, compressionQuality);
      const compression = getEstimatedCompression(compressionQuality);
      
      return res.status(200).json({ 
        success: true, 
        data: {
          ...data.data,
          compressionInfo: {
            format: format,
            quality: quality,
            qualityLevel: compressionQuality,
            estimatedCompressionRatio: compression.ratio,
            estimatedCompressionLabel: compression.label,
            availableFormats: ['jpeg', 'webp'],
            availableQualities: ['high', 'medium', 'low']
          }
        }
      });
    }

    return res.status(400).json({ success: false, error: data?.error_message || 'Imgflip error' });
  } catch (err) {
    console.error('caption proxy error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
