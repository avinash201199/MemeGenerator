import { useState, useEffect } from 'react';

const History = () => {
    const [savedMemes, setSavedMemes] = useState([]);

    useEffect(() => {
        const memeHistory = JSON.parse(localStorage.getItem('memeHistory') || '[]');
        setSavedMemes(memeHistory);
    }, []);

    const downloadMeme = (memeUrl, memeId) => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", memeUrl, true);
        xhr.responseType = "blob";
        xhr.onload = function () {
            const urlCreator = window.URL || window.webkitURL;
            const imageUrl = urlCreator.createObjectURL(this.response);
            const tag = document.createElement('a');
            tag.href = imageUrl;
            tag.download = `meme_${memeId}`;
            document.body.appendChild(tag);
            tag.click();
            document.body.removeChild(tag);
        }
        xhr.send();
    };

    const shareToTwitter = (memeUrl) => {
        const text = "Check out this meme I made!";
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(memeUrl)}`;
        window.open(url, '_blank');
    };

    const shareToFacebook = (memeUrl) => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(memeUrl)}`;
        window.open(url, '_blank');
    };

    const shareToReddit = (memeUrl) => {
        const title = "Check out this meme I made!";
        const url = `https://reddit.com/submit?url=${encodeURIComponent(memeUrl)}&title=${encodeURIComponent(title)}`;
        window.open(url, '_blank');
    };

    const copyToClipboard = (memeUrl) => {
        navigator.clipboard.writeText(memeUrl).then(() => {
            alert("Meme URL copied to clipboard!");
        }).catch(() => {
            alert("Failed to copy URL");
        });
    };

    const clearHistory = () => {
        if (window.confirm('Are you sure you want to clear all meme history?')) {
            localStorage.removeItem('memeHistory');
            setSavedMemes([]);
        }
    };

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    };

    if (savedMemes.length === 0) {
        return (
            <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: 'white',
                minHeight: '60vh'
            }}>
                <h2>Meme History</h2>
                <p style={{ fontSize: '18px', marginTop: '20px' }}>
                    No memes in history yet. Generate some memes to see them here!
                </p>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', minHeight: '80vh' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px',
                flexWrap: 'wrap',
                gap: '10px'
            }}>
                <h2 style={{ color: 'white', margin: 0 }}>Meme History ({savedMemes.length})</h2>
                <button
                    onClick={clearHistory}
                    style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    Clear History
                </button>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '20px',
                padding: '0 10px'
            }}>
                {savedMemes.map((meme) => (
                    <div key={meme.id} style={{
                        backgroundColor: '#2d3748',
                        borderRadius: '10px',
                        padding: '15px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}>
                        <img
                            src={meme.url}
                            alt="Generated meme"
                            style={{
                                width: '100%',
                                height: '200px',
                                objectFit: 'contain',
                                borderRadius: '5px',
                                backgroundColor: '#1a202c'
                            }}
                        />

                        <div style={{ marginTop: '15px' }}>
                            <p style={{
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                margin: '0 0 5px 0'
                            }}>
                                {meme.template_name}
                            </p>

                            {meme.texts.length > 0 && (
                                <div style={{ marginBottom: '10px' }}>
                                    {meme.texts.map((text, index) => (
                                        text && <p key={index} style={{
                                            color: '#cbd5e0',
                                            fontSize: '12px',
                                            margin: '2px 0',
                                            fontStyle: 'italic'
                                        }}>
                                            &quot;{text}&quot;
                                        </p>
                                    ))}
                                </div>
                            )}

                            <p style={{
                                color: '#a0aec0',
                                fontSize: '11px',
                                margin: '0 0 15px 0'
                            }}>
                                {formatDate(meme.created_at)}
                            </p>

                            <div style={{
                                display: 'flex',
                                gap: '8px',
                                flexWrap: 'wrap',
                                marginBottom: '10px'
                            }}>
                                <button
                                    onClick={() => downloadMeme(meme.url, meme.id)}
                                    style={{
                                        backgroundColor: '#4299e1',
                                        color: 'white',
                                        border: 'none',
                                        padding: '6px 12px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '12px'
                                    }}
                                >
                                    📥 Download
                                </button>

                                <button
                                    onClick={() => copyToClipboard(meme.url)}
                                    style={{
                                        backgroundColor: '#6B7280',
                                        color: 'white',
                                        border: 'none',
                                        padding: '6px 12px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '12px'
                                    }}
                                >
                                    📋 Copy
                                </button>
                            </div>

                            <div style={{
                                display: 'flex',
                                gap: '6px',
                                flexWrap: 'wrap'
                            }}>
                                <button
                                    onClick={() => shareToTwitter(meme.url)}
                                    style={{
                                        backgroundColor: '#1DA1F2',
                                        color: 'white',
                                        border: 'none',
                                        padding: '5px 8px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '11px'
                                    }}
                                >
                                    🐦
                                </button>

                                <button
                                    onClick={() => shareToFacebook(meme.url)}
                                    style={{
                                        backgroundColor: '#4267B2',
                                        color: 'white',
                                        border: 'none',
                                        padding: '5px 8px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '11px'
                                    }}
                                >
                                    📘
                                </button>

                                <button
                                    onClick={() => shareToReddit(meme.url)}
                                    style={{
                                        backgroundColor: '#FF4500',
                                        color: 'white',
                                        border: 'none',
                                        padding: '5px 8px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '11px'
                                    }}
                                >
                                    🔥
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default History;