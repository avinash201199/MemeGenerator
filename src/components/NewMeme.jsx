/* eslint-disable no-unused-vars */
import React, { useState } from 'react';

export default function NewMeme() {
  const [templateId, setTemplateId] = useState('');
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [imageURL, setImageURL] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_id: templateId,
          boxes: [
            { text: topText },
            { text: bottomText }
          ]
        })
      });
      const data = await res.json();
      setImageURL(data.url);
    } catch (error) {
      alert('Failed to generate meme!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <h2 className="text-2xl font-bold">Create a New Meme</h2>
      <form onSubmit={handleGenerate} className="flex flex-col gap-2 w-full max-w-md">
        <input className="p-2 border rounded" placeholder="Template ID"
          value={templateId} onChange={(e) => setTemplateId(e.target.value)} />
        <input className="p-2 border rounded" placeholder="Top Text"
          value={topText} onChange={(e) => setTopText(e.target.value)} />
        <input className="p-2 border rounded" placeholder="Bottom Text"
          value={bottomText} onChange={(e) => setBottomText(e.target.value)} />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate Meme'}
        </button>
      </form>

      {imageURL && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Generated Meme:</h3>
          <img src={imageURL} alt="Meme" className="rounded shadow-lg mt-2" />
        </div>
      )}
    </div>
  );
}
