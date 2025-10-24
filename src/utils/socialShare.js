/**
 * Social Media Share Utilities
 * Reusable functions for sharing memes across various social platforms
 * Includes compression and file size tracking features
 */

/**
 * Format file size in human-readable format
 * @param {number} bytes - Size in bytes
 * @returns {string} - Formatted size string
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Get file size from blob or URL
 * @param {Blob|string} fileOrUrl - File blob or URL
 * @returns {Promise<number>} - File size in bytes
 */
export const getFileSize = async (fileOrUrl) => {
  try {
    if (fileOrUrl instanceof Blob) {
      return fileOrUrl.size;
    } else if (typeof fileOrUrl === 'string') {
      const response = await fetch(fileOrUrl, { method: 'HEAD' });
      const size = response.headers.get('content-length');
      return size ? parseInt(size) : null;
    }
    return null;
  } catch (error) {
    console.error('Error getting file size:', error);
    return null;
  }
};

/**
 * Get compression recommendations based on file size
 * @param {number} sizeInBytes - File size in bytes
 * @returns {object} - Compression recommendations
 */
export const getCompressionRecommendation = (sizeInBytes) => {
  const sizeInMB = sizeInBytes / (1024 * 1024);
  
  if (sizeInMB < 1) {
    return { quality: 'high', label: 'Already Optimized', recommendation: 'No compression needed' };
  } else if (sizeInMB < 3) {
    return { quality: 'medium', label: 'Balanced', recommendation: 'Medium compression recommended' };
  } else {
    return { quality: 'low', label: 'Optimized', recommendation: 'High compression recommended' };
  }
};

/**
 * Share meme to Twitter/X
 * @param {string} memeUrl - URL of the meme image
 * @param {string} text - Optional custom text (default: "Check out this meme I made!")
 */
export const shareToTwitter = (memeUrl, text = "Check out this meme I made!") => {
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(memeUrl)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};

/**
 * Share meme to Facebook
 * @param {string} memeUrl - URL of the meme image
 */
export const shareToFacebook = (memeUrl) => {
  const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(memeUrl)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};

/**
 * Share meme to Reddit
 * @param {string} memeUrl - URL of the meme image
 * @param {string} title - Optional custom title (default: "Check out this meme I made!")
 */
export const shareToReddit = (memeUrl, title = "Check out this meme I made!") => {
  const url = `https://reddit.com/submit?url=${encodeURIComponent(memeUrl)}&title=${encodeURIComponent(title)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};

/**
 * Share meme to Instagram (copies URL to clipboard)
 * Instagram doesn't support direct URL sharing, so we copy the URL for users to paste
 * @param {string} memeUrl - URL of the meme image
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
export const shareToInstagram = async (memeUrl) => {
  try {
    await navigator.clipboard.writeText(memeUrl);
    alert("Meme URL copied! You can now paste it in Instagram or download the image to share as a story/post.");
    return true;
  } catch (error) {
    alert("Failed to copy URL. Please manually copy the meme URL to share on Instagram.");
    return false;
  }
};

/**
 * Share meme to WhatsApp
 * @param {string} memeUrl - URL of the meme image
 * @param {string} text - Optional custom text (default: "Check out this meme I made!")
 */
export const shareToWhatsApp = (memeUrl, text = "Check out this meme I made!") => {
  const message = `${text} ${memeUrl}`;
  const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};

/**
 * Copy meme URL to clipboard
 * @param {string} memeUrl - URL of the meme image
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
export const copyToClipboard = async (memeUrl) => {
  try {
    await navigator.clipboard.writeText(memeUrl);
    alert("Meme URL copied to clipboard!");
    return true;
  } catch (error) {
    alert("Failed to copy URL");
    return false;
  }
};

/**
 * Download meme image with optional compression info display
 * @param {string} memeUrl - URL of the meme image
 * @param {string|number} filename - Filename for the downloaded meme (default: "meme")
 * @param {object} compressionInfo - Optional compression information to display
 */
export const downloadMeme = (memeUrl, filename = "meme", compressionInfo = null) => {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", memeUrl, true);
  xhr.responseType = "blob";
  xhr.onload = function () {
    const fileSize = this.response.size;
    const formattedSize = formatFileSize(fileSize);
    
    // Log compression info if available
    if (compressionInfo) {
      console.log(`Downloading: ${filename}`);
      console.log(`File Size: ${formattedSize}`);
      console.log(`Compression Ratio: ${compressionInfo.compressionRatio}%`);
      console.log(`Format: ${compressionInfo.format}`);
    }
    
    const urlCreator = window.URL || window.webkitURL;
    const imageUrl = urlCreator.createObjectURL(this.response);
    const tag = document.createElement('a');
    tag.href = imageUrl;
    tag.download = filename;
    document.body.appendChild(tag);
    tag.click();
    document.body.removeChild(tag);
    // Clean up the blob URL
    urlCreator.revokeObjectURL(imageUrl);
  };
  xhr.onerror = function () {
    alert("Failed to download meme. Please try again.");
  };
  xhr.send();
};

/**
 * Get all share functions as an object
 * Useful for passing to components
 */
export const socialShareUtils = {
  shareToTwitter,
  shareToFacebook,
  shareToReddit,
  shareToInstagram,
  shareToWhatsApp,
  copyToClipboard,
  downloadMeme,
  formatFileSize,
  getFileSize,
  getCompressionRecommendation
};

export default socialShareUtils;

