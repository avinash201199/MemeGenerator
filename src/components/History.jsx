import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useToast } from '../contexts/ToastContext';
import {
    shareToTwitter,
    shareToFacebook,
    shareToReddit,
    shareToWhatsApp,
    downloadMeme
} from '../utils/socialShare';

const History = () => {
    const toast = useToast(); 
    const [savedMemes, setSavedMemes] = useState([]);

    useEffect(() => {
        const memeHistory = JSON.parse(localStorage.getItem('memeHistory') || '[]');
        setSavedMemes(memeHistory);
    }, []);

    const shareToInstagram = (memeUrl) => {
        navigator.clipboard.writeText(memeUrl).then(() => {
            toast.success("Meme URL copied! Paste it in Instagram or download to share as story/post.", 4000);
        }).catch(() => {
            toast.error("Failed to copy URL. Please try again.");
        });
    };

    const copyToClipboard = (memeUrl) => {
        navigator.clipboard.writeText(memeUrl).then(() => {
            toast.success("Meme URL copied to clipboard!");
        }).catch(() => {
            toast.error("Failed to copy URL");
        });
    };

    const clearHistory = () => {
        if (window.confirm('Are you sure you want to clear all meme history?')) {
            localStorage.removeItem('memeHistory');
            setSavedMemes([]);
            toast.info('Meme history cleared successfully!');
        }
    };

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (savedMemes.length === 0) {
        return (
            <>
            <Navbar />
            <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: 'white',
                minHeight: '60vh'
            }}>
                <h2 className="history-heading" style={{ color: 'white' }}>Meme History</h2>
                <p style={{ fontSize: '18px', marginTop: '20px' }}>
                    No memes in history yet. Generate some memes to see them here!
                </p>
            </div>
            </>
        );
    }

    return (<>
        <Navbar />
        <div style={{ padding: '20px', minHeight: '80vh' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px',
                flexWrap: 'wrap',
                gap: '10px'
            }}>
                <h2 className="history-heading" style={{ color: 'white' }}>Meme History ({savedMemes.length})</h2>
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
                        backgroundColor:  '#2d3748',
                        borderRadius: '15px',
                        padding: '10px',
                        // boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
                        border: '2px solid transparent',
                        // backgroundImage: 'linear-gradient(#2d3748, #2d3748), linear-gradient(45deg, #ec4899, #8b5cf6, #06b6d4)',
                        // backgroundOrigin: 'border-box',
                        // backgroundClip: 'content-box, border-box',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-5px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
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
                                fontSize: '18px',
                                fontWeight: 'bold',
                                margin: '0 0 8px 0',
                                textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                            }}>
                                {meme.template_name}
                            </p>

                            {meme.texts.length > 0 && (
                                <div style={{ marginBottom: '10px' }}>
                                    {meme.texts.map((text, index) => (
                                        text && <p key={index} style={{
                                            color: '#fbbf24',
                                            fontSize: '13px',
                                            margin: '3px 0',
                                            fontStyle: 'italic',
                                            fontWeight: '500'
                                        }}>
                                            &quot;{text}&quot;
                                        </p>
                                    ))}
                                </div>
                            )}

                            <p style={{
                                color: '#34d399',
                                fontSize: '12px',
                                margin: '0 0 20px 0',
                                fontWeight: '600'
                            }}>
                                {formatDate(meme.created_at)}
                            </p>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '15px',
                                flexWrap: 'wrap',
                                gap: '10px'
                            }}>
                                <button
                                    onClick={() => downloadMeme(meme.url, `meme_${meme.id}`)}
                                    style={{
                                        backgroundColor: '#4299e1',
                                        color: 'white',
                                        border: 'none',
                                        padding: '8px 16px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        fontWeight: '500',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#3182ce'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = '#4299e1'}
                                >
                                    💾 Download
                                </button>

                                <button
                                    onClick={() => copyToClipboard(meme.url)}
                                    style={{
                                        backgroundColor: '#6B7280',
                                        color: 'white',
                                        border: 'none',
                                        padding: '8px 16px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        fontWeight: '500',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#4b5563'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = '#6B7280'}
                                >
                                    📋 Copy Link
                                </button>
                            </div>

                            <div style={{ marginBottom: '10px' }}>
                                <h5 style={{
                                    color: '#e2e8f0',
                                    fontSize: '14px',
                                    margin: '0 0 8px 0',
                                    fontWeight: '600'
                                }}>Share Your Meme:</h5>
                                <div style={{
                                    display: 'flex',
                                    gap: '10px',
                                    flexWrap: 'wrap'
                                }}>
                                    <button
                                        onClick={() => shareToTwitter(meme.url)}
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            backgroundColor: '#1DA1F2',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.backgroundColor = '#1a91da';
                                            e.target.style.transform = 'scale(1.1)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.backgroundColor = '#1DA1F2';
                                            e.target.style.transform = 'scale(1)';
                                        }}
                                        title="Share on Twitter"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                        </svg>
                                    </button>

                                    <button
                                        onClick={() => shareToFacebook(meme.url)}
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            backgroundColor: '#1877F2',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.backgroundColor = '#166fe5';
                                            e.target.style.transform = 'scale(1.1)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.backgroundColor = '#1877F2';
                                            e.target.style.transform = 'scale(1)';
                                        }}
                                        title="Share on Facebook"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                        </svg>
                                    </button>

                                    <button
                                        onClick={() => shareToReddit(meme.url)}
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            backgroundColor: '#FF4500',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.backgroundColor = '#e03d00';
                                            e.target.style.transform = 'scale(1.1)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.backgroundColor = '#FF4500';
                                            e.target.style.transform = 'scale(1)';
                                        }}
                                        title="Share on Reddit"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                                        </svg>
                                    </button>

                                    <button
                                        onClick={() => shareToInstagram(meme.url)}
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            background: 'linear-gradient(45deg, #833ab4, #fd1d1d, #fcb045)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.opacity = '0.8';
                                            e.target.style.transform = 'scale(1.1)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.opacity = '1';
                                            e.target.style.transform = 'scale(1)';
                                        }}
                                        title="Share on Instagram"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                        </svg>
                                    </button>

                                    <button
                                        onClick={() => shareToWhatsApp(meme.url)}
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            backgroundColor: '#25D366',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.backgroundColor = '#20b858';
                                            e.target.style.transform = 'scale(1.1)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.backgroundColor = '#25D366';
                                            e.target.style.transform = 'scale(1)';
                                        }}
                                        title="Share on WhatsApp"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" enable-background="new 0 0 128 128" height="20px" id="Layer_1" version="1.1" viewBox="0 0 128 128" width="20px" xml:space="preserve"><g><path d="M92.346,35.49c-7.522-7.53-17.523-11.678-28.179-11.683c-21.954,0-39.826,17.868-39.833,39.831   c-0.004,7.022,1.831,13.875,5.316,19.913L24,104.193l21.115-5.538c5.819,3.171,12.369,4.844,19.036,4.847h0.017l0,0   c21.954,0,39.823-17.871,39.832-39.833C104.005,53.027,99.864,43.019,92.346,35.49 M64.168,96.774h-0.013   c-5.943-0.002-11.769-1.598-16.853-4.614l-1.209-0.718l-12.53,3.287l3.343-12.216l-0.787-1.256   c-3.315-5.27-5.066-11.361-5.062-17.619c0.006-18.253,14.859-33.104,33.121-33.104c8.844,0.002,17.155,3.451,23.407,9.71   c6.251,6.258,9.691,14.575,9.689,23.422C97.268,81.922,82.415,96.774,64.168,96.774 M82.328,71.979   c-0.996-0.499-5.889-2.904-6.802-3.239c-0.913-0.332-1.574-0.497-2.238,0.499s-2.571,3.239-3.153,3.903   c-0.58,0.664-1.16,0.748-2.156,0.249s-4.202-1.549-8.001-4.941c-2.96-2.637-4.958-5.899-5.538-6.895s-0.062-1.533,0.437-2.03   c0.448-0.446,0.996-1.162,1.493-1.744c0.497-0.582,0.663-0.997,0.995-1.66c0.332-0.664,0.167-1.245-0.083-1.743   c-0.25-0.499-2.24-5.398-3.068-7.391c-0.809-1.941-1.629-1.678-2.239-1.708c-0.582-0.028-1.245-0.036-1.908-0.036   c-0.663,0-1.742,0.249-2.654,1.246c-0.911,0.996-3.483,3.403-3.483,8.304c0,4.898,3.566,9.632,4.064,10.295   c0.498,0.663,7.018,10.718,17.002,15.029c2.374,1.024,4.229,1.637,5.674,2.097c2.384,0.759,4.554,0.65,6.27,0.394   c1.912-0.285,5.888-2.407,6.719-4.732c0.829-2.324,0.829-4.316,0.578-4.732C83.986,72.727,83.322,72.478,82.328,71.979" fill="#FFFFFF"/></g></svg>  
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        <Footer />
    </>

    );
};

export default History;
