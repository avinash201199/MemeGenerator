/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { useToast } from "./contexts/ToastContext";
import {
    shareToTwitter,
    shareToFacebook,
    shareToReddit,
    shareToWhatsApp,
    downloadMeme
} from "./utils/socialShare";
import { generateSimpleMeme } from "./utils/simpleMemeCanvas";

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
    
    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 's':
                        e.preventDefault();
                        downloadMeme(meme.url, "meme");
                        break;
                    case 'Enter':
                        e.preventDefault();
                        if (!isLoading) {
                            document.querySelector('form').requestSubmit();
                        }
                        break;
                }
            }
            if (e.key === 'Escape') {
                setMeme(null);
            }
        };
        
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [meme.url, isLoading, setMeme]);

    const saveMemeToHistory = (memeData) => {
        const savedMemes = JSON.parse(localStorage.getItem('memeHistory') || '[]');
        const newMeme = {
            id: Date.now(),
            url: memeData.url,
            template_name: meme.name || 'Unknown Template',
            texts: form.boxes.map(box => box.text || ''),
            created_at: new Date().toISOString()
        };
        savedMemes.unshift(newMeme);
        localStorage.setItem('memeHistory', JSON.stringify(savedMemes));
    };

    const generatememe = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setShowError(false);

        try {
            // Get the text values from form
            const texts = (form.boxes || []).map((b) => b?.text ?? '');
            
            // Try client-side canvas generation first
            try {
                console.log('Generating meme with canvas:', { 
                    imageUrl: meme.url, 
                    texts, 
                    boxCount: meme.box_count 
                });
                
                // Add timeout to prevent hanging
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Canvas generation timeout')), 5000)
                );
                
                // Use simple canvas generation for better reliability
                const generatedUrl = await Promise.race([
                    generateSimpleMeme(meme.url, texts),
                    timeoutPromise
                ]);

                console.log('Canvas generation successful, URL:', generatedUrl);
                
                setIsLoading(false);
                setMeme({ ...meme, url: generatedUrl });
                setMemeGenerated(true);
                setShowSuccessNote(true);
                
                // Save to history with the generated URL
                saveMemeToHistory({ url: generatedUrl });
                setTimeout(() => setShowSuccessNote(false), 4000);
                return;
                
            } catch (canvasError) {
                console.log('Canvas generation failed, trying API fallback:', canvasError);
                
                // Fallback to API method
                const resp = await fetch('/api/caption', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        template_id: form.template_id,
                        boxes: texts.map((text) => ({ text })),
                    })
                });
                const data = await resp.json();

                setIsLoading(false);
                if (data?.success && data?.data?.url) {
                    setMeme({ ...meme, url: data.data.url });
                    setMemeGenerated(true);
                    setShowSuccessNote(true);
                    saveMemeToHistory(data.data);
                    setTimeout(() => setShowSuccessNote(false), 4000);
                } else {
                    throw new Error(data?.error || 'API generation failed');
                }
            }
            
        } catch (err) {
            console.error('Error generating meme:', err);
            setIsLoading(false);
            setError('Failed to generate meme. Please try again.');
            setShowError(true);
            setTimeout(() => { setShowError(false); setError(''); }, 2000);
        }
    }

    const shareToInstagram = () => {
        navigator.clipboard.writeText(meme.url).then(() => {
            toast.success("Meme URL copied! Paste it in Instagram or download to share as story/post.", 4000);
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

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900">
            <form onSubmit={generatememe} className="w-full max-w-6xl">
                {/* Main Content Container */}
                <div className="flex flex-col lg:flex-row items-center justify-center gap-8 w-full">
                    
                    {/* Left Section - Image */}
                    <div className="flex-1 flex flex-col items-center">
                        <div className="relative group">
                            <img 
                                src={meme.url} 
                                alt="meme" 
                                className="max-w-full max-h-96 object-contain rounded-lg shadow-lg border-4 border-pink-500 transition-transform hover:scale-105"
                            />
                            {/* Meme Info Overlay */}
                            <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                {meme.width}x{meme.height}px
                            </div>
                        </div>
                        
                        {/* Meme Stats */}
                        <div className="mt-4 text-center">
                            <h2 className="text-white text-lg font-bold mb-2">{meme.name}</h2>
                            <div className="flex gap-4 text-sm text-gray-400">
                                <span>📝 {meme.box_count} text boxes</span>
                                <span>📈 {meme.width}x{meme.height}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Section - Caption Inputs */}
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                        <div className="text-center mb-4">
                            <h3 className="text-white text-xl font-bold mb-2">Add Your Captions</h3>
                            <div className="text-gray-400 text-xs space-y-1">
                                <p>📝 Fill in the text boxes below</p>
                                <p>⌨️ Shortcuts: Ctrl+S (Save), Ctrl+Enter (Generate), Esc (Back)</p>
                            </div>
                        </div>
                        <div className="space-y-4 w-full max-w-md">
                            {[...Array(meme.box_count)].map((_, index) => (
                                <div key={index} className="space-y-2">
                                    <input
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
                                    {/* Quick Text Options */}
                                    <div className="flex gap-2 text-xs">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const input = document.querySelector(`input:nth-of-type(${index + 1})`);
                                                input.value = input.value.toUpperCase();
                                                const newBox = form.boxes;
                                                newBox[index] = { text: input.value };
                                                setForm({ ...form, boxes: newBox });
                                            }}
                                            className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded"
                                        >
                                            CAPS
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const suggestions = ['Me:', 'When you:', 'POV:', 'Nobody:', 'Everyone:'];
                                                const random = suggestions[Math.floor(Math.random() * suggestions.length)];
                                                const newBox = form.boxes;
                                                newBox[index] = { text: random };
                                                setForm({ ...form, boxes: newBox });
                                            }}
                                            className="bg-pink-700 hover:bg-pink-600 text-white px-2 py-1 rounded"
                                        >
                                            💡 Suggest
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
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
                                ❌ Failed - Try Again
                            </>
                        ) : showSuccessNote ? (
                            <>
                                ✅ Meme Created!
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
                        onClick={() => downloadMeme(meme.url, "meme")}
                        title="Save meme (Ctrl+S)"
                    >
                        💾 Save
                    </button>
                    
                    {/* Quick Actions */}
                    <button 
                        type="button"
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg transition-colors font-medium"
                        onClick={() => {
                            // Clear all inputs
                            setForm({ ...form, boxes: [] });
                            document.querySelectorAll('input[type="text"]').forEach(input => input.value = '');
                        }}
                        title="Clear all text"
                    >
                        🗑️ Clear
                    </button>
                    
                    <button 
                        type="button"
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-3 rounded-lg transition-colors font-medium"
                        onClick={() => {
                            // Random meme suggestions
                            const suggestions = [
                                ['Me trying to code', 'My computer'],
                                ['Monday morning', 'Me'],
                                ['When it works', 'When it doesn\'t'],
                                ['Expectation', 'Reality']
                            ];
                            const random = suggestions[Math.floor(Math.random() * suggestions.length)];
                            const newBoxes = [];
                            random.forEach((text, i) => {
                                if (i < meme.box_count) {
                                    newBoxes[i] = { text };
                                    const input = document.querySelectorAll('input[type="text"]')[i];
                                    if (input) input.value = text;
                                }
                            });
                            setForm({ ...form, boxes: newBoxes });
                        }}
                        title="Random meme ideas"
                    >
                        🎲 Random
                    </button>
                    
                    {/* Success Note */}
                    {showSuccessNote && (
                        <div className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 animate-pulse">
                            ✅ Meme Generated! Scroll down to share →
                        </div>
                    )}
                    
                    {/* Error Message */}
                    {showError && (
                        <div className="bg-red-900/20 border border-red-500/50 text-red-300 px-4 py-2 rounded-lg flex items-start gap-2">
                            <span>⚠️</span>
                            <div>
                                <p className="font-medium">Generation Failed</p>
                                <p className="text-xs text-red-400">{error}</p>
                                <p className="text-xs text-gray-400 mt-1">Check your connection and try again</p>
                            </div>
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
                            onClick={() => shareToTwitter(meme.url)}
                        >
                            🐦 Twitter
                        </button>
                        <button
                            className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                            onClick={() => shareToFacebook(meme.url)}
                        >
                            📘 Facebook
                        </button>
                        <button
                            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                            onClick={() => shareToReddit(meme.url)}
                        >
                            🔥 Reddit
                        </button>
                        <button
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                            onClick={() => shareToInstagram(meme.url)}
                        >
                            📷 Instagram
                        </button>
                        <button
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                            onClick={() => shareToWhatsApp(meme.url)}
                        >
                            💬 WhatsApp
                        </button>
                        <button
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                            onClick={() => copyToClipboard(meme.url)}
                        >
                            📋 Copy Link
                        </button>
                        
                        {/* Additional Share Options */}
                        <button
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                            onClick={() => {
                                if (navigator.share) {
                                    navigator.share({
                                        title: 'Check out this meme!',
                                        text: `Funny meme: ${meme.name}`,
                                        url: meme.url
                                    });
                                } else {
                                    copyToClipboard(meme.url);
                                }
                            }}
                        >
                            🚀 Share
                        </button>
                        
                        <button
                            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                            onClick={() => {
                                const text = `Check out this meme: ${meme.name} - ${meme.url}`;
                                navigator.clipboard.writeText(text).then(() => {
                                    toast.success("Meme text copied with link!");
                                });
                            }}
                        >
                            📝 Copy Text
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Meme;
