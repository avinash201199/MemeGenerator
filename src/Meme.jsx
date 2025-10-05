/* eslint-disable react/prop-types */
import { useState } from "react";

const Meme = ({ meme, setMeme }) => {

    const [form, setForm] = useState({
        template_id: meme.id,
        username: "RituGupta",
        password: "Ritu@123",
        boxes: [],

    });

    const [memeGenerated, setMemeGenerated] = useState(false);
    const [showSuccessNote, setShowSuccessNote] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showError, setShowError] = useState(false);

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

    const generatememe = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setShowError(false);
        
        let url = `https://api.imgflip.com/caption_image?template_id=${form.template_id}&username=${form.username}&password=${form.password}`;
        form.boxes.map((box, index) => {
            return (url += (`&boxes[${index}][text]=${box.text}`));
        });
        console.log(url)
        fetch(url).then((res) => res.json())
            .then((data) => {
                setIsLoading(false);
                if (data.success === true) {
                    setMeme({ ...meme, url: data.data.url })
                    setMemeGenerated(true);
                    setShowSuccessNote(true);
                    saveMemeToHistory(data.data);
                    
                    // Hide success note after 4 seconds
                    setTimeout(() => {
                        setShowSuccessNote(false);
                    }, 4000);
                } else {
                    // Handle API error
                    setError(data.error_message || 'Failed to generate meme. Please try again.');
                    setShowError(true);
                    
                    // Hide error after 2 seconds
                    setTimeout(() => {
                        setShowError(false);
                        setError('');
                    }, 2000);
                }
            })
            .catch((error) => {
                setIsLoading(false);
                console.error('Error:', error);
                setError('Network error. Please check your connection and try again.');
                setShowError(true);
                
                // Hide error after 2 seconds
                setTimeout(() => {
                    setShowError(false);
                    setError('');
                }, 2000);
            });
    }
    function save() {
        var xhr = new XMLHttpRequest();
        var url = meme.url;
        xhr.open("GET", url, true);
        xhr.responseType = "blob";
        xhr.onload = function () {
            var urlCreator = window.URL || window.webkitURL;
            var imageUrl = urlCreator.createObjectURL(this.response);
            var tag = document.createElement('a');
            tag.href = imageUrl;
            tag.download = "meme";
            document.body.appendChild(tag);
            tag.click();
            document.body.removeChild(tag);
        }
        xhr.send();
    }

    const shareToTwitter = () => {
        const text = "Check out this meme I made!";
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(meme.url)}`;
        window.open(url, '_blank');
    };

    const shareToFacebook = () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(meme.url)}`;
        window.open(url, '_blank');
    };

    const shareToReddit = () => {
        const title = "Check out this meme I made!";
        const url = `https://reddit.com/submit?url=${encodeURIComponent(meme.url)}&title=${encodeURIComponent(title)}`;
        window.open(url, '_blank');
    };

    const shareToInstagram = () => {
        // Instagram doesn't support direct URL sharing, so we'll copy the image URL
        navigator.clipboard.writeText(meme.url).then(() => {
            alert("Meme URL copied! You can now paste it in Instagram or download the image to share as a story/post.");
        }).catch(() => {
            alert("Failed to copy URL. Please manually copy the meme URL to share on Instagram.");
        });
    };

    const shareToWhatsApp = () => {
        const text = "Check out this meme I made! " + meme.url;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(meme.url).then(() => {
            alert("Meme URL copied to clipboard!");
        }).catch(() => {
            alert("Failed to copy URL");
        });
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

                    {/* Right Section - Caption Inputs */}
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
                        onClick={save}
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
                            onClick={shareToTwitter}
                        >
                            � Twitter
                        </button>
                        <button
                            className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                            onClick={shareToFacebook}
                        >
                            📘 Facebook
                        </button>
                        <button
                            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                            onClick={shareToReddit}
                        >
                            🔥 Reddit
                        </button>
                        <button
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                            onClick={shareToInstagram}
                        >
                            📷 Instagram
                        </button>
                        <button
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                            onClick={shareToWhatsApp}
                        >
                            💬 WhatsApp
                        </button>
                        <button
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                            onClick={copyToClipboard}
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