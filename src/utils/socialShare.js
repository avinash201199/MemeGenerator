/**
 * Social Media Share Utilities
 * Reusable functions for sharing memes across various social platforms
 */

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
 * Download meme image
 * @param {string} memeUrl - URL of the meme image
 * @param {string|number} filename - Filename for the downloaded meme (default: "meme")
 */
export const downloadMeme = (memeUrl, filename = "meme") => {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", memeUrl, true);
  xhr.responseType = "blob";
  xhr.onload = function () {
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
  downloadMeme
};

export default socialShareUtils;

