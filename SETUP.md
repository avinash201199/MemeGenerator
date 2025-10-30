# Meme Generator Setup Guide

## ✅ Current Status: WORKING IN DEMO MODE

The meme generator is now running with demo mode enabled! You can test it immediately.

## 🚀 Quick Start

1. **Run the project:**
   ```bash
   npm run dev:full
   ```

2. **Open your browser:** http://localhost:5173/

3. **Test it:** Select a meme template, add captions, and click "Generate Meme"

## 🎯 Demo Mode vs Real Mode

### Demo Mode (Current)
- ✅ Works immediately without setup
- ✅ Shows placeholder images with your text
- ✅ Perfect for testing the interface
- ⚠️ Uses placeholder images instead of real memes

### Real Mode (Optional)
To generate actual memes with Imgflip:

1. **Get Imgflip Credentials (Free):**
   - Sign up at [imgflip.com/signup](https://imgflip.com/signup)
   - Your username and password are your API credentials

2. **Update `.env.local`:**
   ```
   IMGFLIP_USERNAME=your_actual_username
   IMGFLIP_PASSWORD=your_actual_password
   ```

3. **Restart the server:**
   ```bash
   npm run dev:full
   ```

## 🛠 Development Commands

- `npm run dev` - Frontend only
- `npm run dev:api` - API server only  
- `npm run dev:full` - Both servers (recommended)

## 🎉 What's Working

- ✅ Frontend running on http://localhost:5173/
- ✅ API server running on http://localhost:3001/
- ✅ Demo mode for immediate testing
- ✅ Real Imgflip integration ready when you add credentials