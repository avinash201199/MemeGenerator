// Client-side meme generation using HTML5 Canvas
export const generateMemeWithCanvas = async (imageUrl, texts, templateBoxCount = 2) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw the base image
      ctx.drawImage(img, 0, 0);
      
      // Configure text style
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 3;
      ctx.textAlign = 'center';
      ctx.font = 'bold 40px Impact, Arial Black, sans-serif';
      
      // Add text based on template box count
      if (templateBoxCount === 2) {
        // Top and bottom text (classic meme format)
        if (texts[0]) {
          const topText = texts[0].toUpperCase();
          ctx.strokeText(topText, canvas.width / 2, 50);
          ctx.fillText(topText, canvas.width / 2, 50);
        }
        
        if (texts[1]) {
          const bottomText = texts[1].toUpperCase();
          ctx.strokeText(bottomText, canvas.width / 2, canvas.height - 20);
          ctx.fillText(bottomText, canvas.width / 2, canvas.height - 20);
        }
      } else {
        // Multiple text boxes - distribute vertically
        texts.forEach((text, index) => {
          if (text) {
            const y = (canvas.height / (templateBoxCount + 1)) * (index + 1);
            const displayText = text.toUpperCase();
            ctx.strokeText(displayText, canvas.width / 2, y);
            ctx.fillText(displayText, canvas.width / 2, y);
          }
        });
      }
      
      // Convert canvas to blob URL
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        resolve(url);
      }, 'image/jpeg', 0.9);
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = imageUrl;
  });
};

// Helper function to wrap text for better display
export const wrapText = (ctx, text, maxWidth) => {
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
};

// Enhanced version with text wrapping
export const generateMemeWithWrapping = async (imageUrl, texts, templateBoxCount = 2) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    // Handle CORS for external images
    if (imageUrl.includes('imgflip.com')) {
      img.crossOrigin = 'anonymous';
    }
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw the base image
      ctx.drawImage(img, 0, 0);
      
      // Calculate responsive font size based on image dimensions
      const baseFontSize = Math.max(20, Math.min(canvas.width / 10, canvas.height / 15));
      
      // Configure text style with better visibility
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = Math.max(2, baseFontSize / 15);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `bold ${baseFontSize}px Impact, "Arial Black", Arial, sans-serif`;
      
      // Add shadow for better text visibility
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      const maxWidth = canvas.width * 0.85;
      
      console.log('Drawing text on canvas:', { texts, templateBoxCount, canvasSize: { width: canvas.width, height: canvas.height } });
      
      if (templateBoxCount === 2) {
        // Top text
        if (texts[0] && texts[0].trim()) {
          const topText = texts[0].toUpperCase();
          const topY = baseFontSize + 20;
          
          // Draw stroke first, then fill
          ctx.strokeText(topText, canvas.width / 2, topY);
          ctx.fillText(topText, canvas.width / 2, topY);
          
          console.log('Drew top text:', topText, 'at position:', canvas.width / 2, topY);
        }
        
        // Bottom text
        if (texts[1] && texts[1].trim()) {
          const bottomText = texts[1].toUpperCase();
          const bottomY = canvas.height - baseFontSize - 20;
          
          // Draw stroke first, then fill
          ctx.strokeText(bottomText, canvas.width / 2, bottomY);
          ctx.fillText(bottomText, canvas.width / 2, bottomY);
          
          console.log('Drew bottom text:', bottomText, 'at position:', canvas.width / 2, bottomY);
        }
      } else {
        // Multiple text boxes - distribute evenly
        texts.forEach((text, index) => {
          if (text && text.trim()) {
            const displayText = text.toUpperCase();
            const sectionHeight = canvas.height / (templateBoxCount + 1);
            const y = sectionHeight * (index + 1);
            
            // Draw stroke first, then fill
            ctx.strokeText(displayText, canvas.width / 2, y);
            ctx.fillText(displayText, canvas.width / 2, y);
            
            console.log(`Drew text ${index + 1}:`, displayText, 'at position:', canvas.width / 2, y);
          }
        });
      }
      
      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      // Convert canvas to blob URL
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          console.log('Canvas meme generated successfully');
          resolve(url);
        } else {
          reject(new Error('Failed to create blob from canvas'));
        }
      }, 'image/jpeg', 0.9);
    };
    
    img.onerror = (error) => {
      console.error('Image load error:', error);
      reject(new Error('Failed to load image: ' + imageUrl));
    };
    
    // Add timeout for image loading
    setTimeout(() => {
      if (!img.complete) {
        reject(new Error('Image loading timeout'));
      }
    }, 10000);
    
    img.src = imageUrl;
  });
};