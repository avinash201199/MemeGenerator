/* eslint-disable react/prop-types */
import { useState } from "react";
import { useToast } from "./contexts/ToastContext";
import {
    shareToTwitter,
    shareToFacebook,
    shareToReddit,
    shareToWhatsApp,
    downloadMeme,
    formatFileSize,
    getCompressionRecommendation
} from "./utils/socialShare";
import AnalyticsTracker from "./utils/analyticsTracker";

const Meme = ({ meme, setMeme }) => {
    const toast = useToast();

    const [form, setForm] = useState({
        template_id: meme.id,
        boxes: [],
    });

    const [memeGenerated, setMemeGenerated] = useState(false);
    const [showSuccessNote, setShowSuccessNote] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showError, setShowError] = useState(false);
    const [compressionQuality, setCompressionQuality] = useState('medium');
    const [showCompressionOptions, setShowCompressionOptions] = useState(false);
    const [compressionInfo, setCompressionInfo] = useState(null);

    const saveMemeToHistory = (memeData) => {
        const savedMemes = JSON.parse(localStorage.getItem('memeHistory') || '[]');
        const newMeme = {
            id: Date.now(),
            url: memeData.url,
            template_name: meme.name || 'Unknown Template',
            texts: form.boxes.map(box => box.text || ''),
            created_at: new Date().toISOString(),
            compressionQuality: compressionQuality
        };
        savedMemes.unshift(newMeme);
        localStorage.setItem('memeHistory', JSON.stringify(savedMemes));

        // Track meme generation
        AnalyticsTracker.trackMemeGeneration(
            form.boxes[0]?.text || 'Generated Meme',
            meme.name || 'Unknown',
            compressionQuality
        );
    };

    const generatememe = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setShowError(false);

        try {
            // POST to our secure serverless proxy with compression settings
            const resp = await fetch('/api/caption', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    template_id: form.template_id,
                    boxes: (form.boxes || []).map((b) => ({ text: b?.text ?? '' })),
                    compressionQuality: compressionQuality,
                    format: 'jpeg'
                })
            });
            const data = await resp.json();

            setIsLoading(false);
            if (data?.success && data?.data?.url) {
                setMeme({ ...meme, url: data.data.url });
                setMemeGenerated(true);
                setShowSuccessNote(true);
                setCompressionInfo(data?.data?.compressionInfo);
                saveMemeToHistory(data.data);
                setTimeout(() => setShowSuccessNote(false), 4000);
            } else {
                setError(data?.error || 'Failed to generate meme. Please try again.');
                setShowError(true);
                setTimeout(() => { setShowError(false); setError(''); }, 2000);
            }
        } catch (err) {
            console.error('Error:', err);
            setIsLoading(false);
            setError('Network error. Please check your connection and try again.');
            setShowError(true);
            setTimeout(() => { setShowError(false); setError(''); }, 2000);
        }
    }

    const shareToInstagram = () => {
        navigator.clipboard.writeText(meme.url).then(() => {
            toast.success("Meme URL copied! Paste it in Instagram or download to share as story/post.", 4000);
            AnalyticsTracker.trackShare('instagram');
        }).catch(() => {
            toast.error("Failed to copy URL. Please try again.");
        });
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(meme.url).then(() => {
            toast.success("Meme URL copied to clipboard!");
        }).catch(() => {
            toast.error("Failed to copy URL");
        });
    };

    const trackAndShare = (platform, shareFunction) => {
        AnalyticsTracker.trackShare(platform);
        return shareFunction();
    };

    const getQualityDescription = (quality) => {
        const descriptions = {
            high: { color: 'text-green-400', bg: 'bg-green-900/30', label: 'High Quality (Best for viewing)' },
            medium: { color: 'text-blue-400', bg: 'bg-blue-900/30', label: 'Medium (Best balance)' },
            low: { color: 'text-orange-400', bg: 'bg-orange-900/30', label: 'Low (Best for sharing)' }
        };
        return descriptions[quality] || descriptions.medium;
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900">
            <form onSubmit={generatememe} className="w-full max-w-6xl">
                {/* Main Content Container */}
                <div className="flex flex-col lg:flex-row items-center justify-center gap-8 w-full">
                    
                    {/* Left Section - Image */}
                    <div className="flex-1 flex justify-center">
                        <img 
                            src={meme.url} 
                            alt="meme" 
                            className="max-w-full max-h-96 object-contain rounded-lg shadow-lg border-4 border-pink-500"
                        />
                    </div>

                    {/* Right Section - Caption Inputs & Compression Settings */}
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                        <h3 className="text-white text-xl font-bold mb-4">Add Your Captions</h3>
                        <div className="space-y-3 w-full max-w-md">
                            {[...Array(meme.box_count)].map((_, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    placeholder={`Caption ${index + 1} (Required)`}
                                    required
                                    className="w-full p-3 rounded-lg border-2 border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:border-pink-500 focus:outline-none transition-colors invalid:border-red-500 invalid:focus:border-red-500"
                                    onChange={(e) => {
                                        const newBox = form.boxes;
                                        newBox[index] = { text: e.target.value };
                                        setForm({ ...form, boxes: newBox });
                                    }}
                                />
                            ))}
                        </div>

                        {/* Compression Quality Selector */}
                        <button
                            type="button"
                            onClick={() => setShowCompressionOptions(!showCompressionOptions)}
                            className="mt-4 w-full max-w-md px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium text-sm"
                        >
                            ⚙️ Compression: {compressionQuality.charAt(0).toUpperCase() + compressionQuality.slice(1)}
                        </button>

                        {showCompressionOptions && (
                            <div className="w-full max-w-md bg-gray-800 rounded-lg p-4 border-2 border-purple-500">
                                <p className="text-white text-sm font-semibold mb-3">Choose compression quality:</p>
                                <div className="space-y-2">
                                    {['high', 'medium', 'low'].map((quality) => {
                                        const desc = getQualityDescription(quality);
                                        const sizeReduction = quality === 'high' ? '~10-20%' : quality === 'medium' ? '~40-50%' : '~60-70%';
                                        return (
                                            <label key={quality} className={`flex items-center p-2 rounded cursor-pointer ${desc.bg} hover:opacity-80 transition-opacity`}>
                                                <input
                                                    type="radio"
                                                    name="compression"
                                                    value={quality}
                                                    checked={compressionQuality === quality}
                                                    onChange={(e) => setCompressionQuality(e.target.value)}
                                                    className="mr-3"
                                                />
                                                <div className="flex-1">
                                                    <p className={`text-sm font-semibold ${desc.color}`}>{desc.label}</p>
                                                    <p className="text-xs text-gray-300">File size reduction: {sizeReduction}</p>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Section - Buttons */}
                <div className="flex flex-wrap gap-4 justify-center mt-8 items-center">
                    <button 
                        type="button"
                        className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                        title="Back" 
                        onClick={() => { setMeme(null) }}
                    >
                        ← Back
                    </button>
                    <button 
                        type="submit"
                        disabled={isLoading}
                        className={`px-6 py-3 rounded-lg transition-all duration-300 font-medium flex items-center gap-2 ${
                            isLoading 
                                ? 'bg-yellow-500 hover:bg-yellow-600 text-white cursor-wait' 
                                : showError 
                                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                                    : showSuccessNote 
                                        ? 'bg-green-600 hover:bg-green-700 text-white'
                                        : 'bg-pink-600 hover:bg-pink-700 text-white'
                        }`}
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                Generating...
                            </>
                        ) : showError ? (
                            <>
                                ❌ Error
                            </>
                        ) : showSuccessNote ? (
                            <>
                                ✅ Success!
                            </>
                        ) : (
                            <>
                                🎨 Generate Meme
                            </>
                        )}
                    </button>
                    <button 
                        type="button"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                        onClick={() => downloadMeme(meme.url, "meme", compressionInfo)}
                    >
                        💾 Save
                    </button>
                    
                    
                    {/* Success Note */}
                    {showSuccessNote && (
                        <div className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 animate-pulse">
                            ✅ Meme Generated! Scroll down to share →
                        </div>
                    )}
                    
                    {/* Error Message */}
                    {showError && (
                        <div className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 animate-bounce">
                            ❌ {error}
                        </div>
                    )}
                </div>
            </form>

            {/* Share Section */}
            {memeGenerated && (
                <div className="mt-8 text-center">
                    <h4 className="text-white text-lg font-bold mb-4">Share Your Meme:</h4>
                    <div className="flex flex-wrap gap-3 justify-center">
                        <button
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                            onClick={() => trackAndShare('twitter', () => shareToTwitter(meme.url))}
                        >
                            🐦 Twitter
                        </button>
                        <button
                            className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                            onClick={() => trackAndShare('facebook', () => shareToFacebook(meme.url))}
                        >
                            📘 Facebook
                        </button>
                        <button
                            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                            onClick={() => trackAndShare('reddit', () => shareToReddit(meme.url))}
                        >
                            🔥 Reddit
                        </button>
                        <button
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                            onClick={() => trackAndShare('instagram', () => shareToInstagram())}
                        >
                            📷 Instagram
                        </button>
                        <button
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                            onClick={() => trackAndShare('whatsapp', () => shareToWhatsApp(meme.url))}
                        >
                            💬 WhatsApp
                        </button>
                        <button
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                            onClick={() => copyToClipboard(meme.url)}
                        >
                            📋 Copy Link
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Meme;
