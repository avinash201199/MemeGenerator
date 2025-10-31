// Debug version to test meme generation step by step
export const debugMemeGeneration = async (imageUrl, texts) => {
  console.log('🔍 Starting debug meme generation');
  console.log('📷 Image URL:', imageUrl);
  console.log('📝 Texts:', texts);
  
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    console.log('🎨 Canvas and context created');
    
    img.onload = () => {
      console.log('✅ Image loaded successfully');
      console.log('📐 Image dimensions:', img.width, 'x', img.height);
      
      // Set canvas size
      canvas.width = img.width;
      canvas.height = img.height;
      console.log('📐 Canvas size set to:', canvas.width, 'x', canvas.height);
      
      // Draw the image
      ctx.drawImage(img, 0, 0);
      console.log('🖼️ Base image drawn');
      
      // Calculate font size
      const fontSize = Math.max(30, Math.min(img.width / 10, img.height / 10));
      console.log('🔤 Font size calculated:', fontSize);
      
      // Set text properties
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      
      console.log('🎨 Text style configured');
      
      // Draw top text with high visibility
      if (texts[0] && texts[0].trim()) {
        const topText = texts[0].toUpperCase();
        const topY = fontSize + 20;
        
        console.log('📝 Drawing top text:', topText, 'at position:', canvas.width / 2, topY);
        
        // Draw thick black outline
        ctx.strokeText(topText, canvas.width / 2, topY);
        // Draw white fill
        ctx.fillText(topText, canvas.width / 2, topY);
        
        console.log('✅ Top text drawn');
      }
      
      // Draw bottom text
      if (texts[1] && texts[1].trim()) {
        const bottomText = texts[1].toUpperCase();
        const bottomY = canvas.height - fontSize - 20;
        
        console.log('📝 Drawing bottom text:', bottomText, 'at position:', canvas.width / 2, bottomY);
        
        // Draw thick black outline
        ctx.strokeText(bottomText, canvas.width / 2, bottomY);
        // Draw white fill
        ctx.fillText(bottomText, canvas.width / 2, bottomY);
        
        console.log('✅ Bottom text drawn');
      }
      
      // Add a test rectangle to verify canvas is working
      ctx.fillStyle = 'red';
      ctx.fillRect(10, 10, 50, 50);
      console.log('🔴 Test red rectangle added');
      
      // Convert to blob
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          console.log('✅ Blob created successfully, URL:', url);
          console.log('📊 Blob size:', blob.size, 'bytes');
          resolve(url);
        } else {
          console.error('❌ Failed to create blob');
          reject(new Error('Failed to create blob'));
        }
      }, 'image/png', 1.0);
      
    };
    
    img.onerror = (error) => {
      console.error('❌ Image load error:', error);
      reject(new Error('Failed to load image'));
    };
    
    console.log('🔄 Starting image load...');
    img.src = imageUrl;
  });
};