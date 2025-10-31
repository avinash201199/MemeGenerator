// Simple and reliable meme canvas generator
export const generateSimpleMeme = async (imageUrl, texts) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    // Don't set crossOrigin for blob URLs or same-origin images
    if (imageUrl.startsWith('https://') && !imageUrl.startsWith(window.location.origin)) {
      img.crossOrigin = 'anonymous';
    }
    
    img.onload = () => {
      try {
        // Set canvas size
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw the image
        ctx.drawImage(img, 0, 0);
        
        // Calculate font size based on image size
        const fontSize = Math.max(24, Math.min(img.width / 12, img.height / 12));
        
        // Set text properties
        ctx.font = `bold ${fontSize}px Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = Math.max(2, fontSize / 12);
        
        // Draw top text
        if (texts[0] && texts[0].trim()) {
          const topText = texts[0].toUpperCase();
          const topY = fontSize + 10;
          
          // Draw outline
          ctx.strokeText(topText, canvas.width / 2, topY);
          // Draw fill
          ctx.fillText(topText, canvas.width / 2, topY);
        }
        
        // Draw bottom text
        if (texts[1] && texts[1].trim()) {
          const bottomText = texts[1].toUpperCase();
          const bottomY = canvas.height - fontSize - 10;
          
          // Draw outline
          ctx.strokeText(bottomText, canvas.width / 2, bottomY);
          // Draw fill
          ctx.fillText(bottomText, canvas.width / 2, bottomY);
        }
        
        // Convert to blob
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            resolve(url);
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, 'image/png', 1.0);
        
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    // Set timeout
    setTimeout(() => {
      reject(new Error('Image loading timeout'));
    }, 5000);
    
    img.src = imageUrl;
  });
};