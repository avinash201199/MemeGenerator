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

    const generatememe = () => {
        let url = `https://api.imgflip.com/caption_image?template_id=${form.template_id}&username=${form.username}&password=${form.password}`;
        form.boxes.map((box, index) => {
            return (url += (`&boxes[${index}][text]=${box.text}`));
        });
        console.log(url)
        fetch(url).then((res) => res.json())
            .then((data) => {
                if (data.success === true) {
                    setMeme({ ...meme, url: data.data.url })
                    setMemeGenerated(true);

                } else {
                    alert("Enter Some Text");
                }

            })
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

    const copyToClipboard = () => {
        navigator.clipboard.writeText(meme.url).then(() => {
            alert("Meme URL copied to clipboard!");
        }).catch(() => {
            alert("Failed to copy URL");
        });
    };
    return (
        <div className="memebnao">
            <img src={meme.url} alt="meme"></img>

            <div>
                {[...Array(meme.box_count)].map((_, index) => (
                    <input
                        key={index}
                        type="text"
                        placeholder={`meme caption-${index + 1}`}
                        onChange={(e) => {

                            const newBox = form.boxes;
                            newBox[index] = { text: e.target.value };
                            setForm({ ...form, boxes: newBox });
                        }}>

                    </input>))}
            </div>

            <div className="btns">
                <span> <button className="backbtn" title="Back" onClick={() => { setMeme(null) }}>Back</button></span>
                <span><button className="generatebutton" onClick={generatememe}>Generate Meme</button></span>
                <span><button className="generatebutton" onClick={save} >Save</button></span>
            </div>

            {memeGenerated && (
                <div className="share-btns" style={{ marginTop: '15px' }}>
                    <h4 style={{ color: 'white', marginBottom: '10px', textAlign: 'center' }}>Share Your Meme:</h4>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            className="share-btn twitter"
                            onClick={shareToTwitter}
                            style={{
                                backgroundColor: '#1DA1F2',
                                color: 'white',
                                border: 'none',
                                padding: '8px 12px',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                            }}
                        >
                            🐦 Twitter
                        </button>
                        <button
                            className="share-btn facebook"
                            onClick={shareToFacebook}
                            style={{
                                backgroundColor: '#4267B2',
                                color: 'white',
                                border: 'none',
                                padding: '8px 12px',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                            }}
                        >
                            📘 Facebook
                        </button>
                        <button
                            className="share-btn reddit"
                            onClick={shareToReddit}
                            style={{
                                backgroundColor: '#FF4500',
                                color: 'white',
                                border: 'none',
                                padding: '8px 12px',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                            }}
                        >
                            🔥 Reddit
                        </button>
                        <button
                            className="share-btn copy"
                            onClick={copyToClipboard}
                            style={{
                                backgroundColor: '#6B7280',
                                color: 'white',
                                border: 'none',
                                padding: '8px 12px',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                            }}
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