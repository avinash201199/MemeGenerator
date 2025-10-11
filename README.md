
# Meme Generator [Link](https://meme-generator-three-psi.vercel.app/)

## Table of Contents
1. Introduction
2. Features
3. Getting Started
4. Prerequisites
5. Installation
6. Contributing
7. License


# Introduction
Welcome to the Meme Generator Website! This documentation will guide you through the setup, usage, and customization of our React-based meme generator. This web application allows users to create, view, and edit memes with ease.



## Screenshots

![image](https://github.com/avinash201199/MemeGenerator/assets/61057666/b80b2277-8d3b-4f4f-bca4-9a7e810d51bb)





## Installation

1. Fork the repo

2. Clone the repos 
```bash 
git clone https://github.com/<your user name>/MemeGenerator.git
```
3. Go the folder

```bash
  cd MemeGenerator
  npm install 
```

4. Add the git upstream
```bash 
git remote add upstream https://github.com/avinash201199/MemeGenerator.git
```

5. Make your own branch
``` bash
git checkout -b <your branch> 
```

6. Add your changes
```bash 
git add .
```
7. Commit your changes
```bash 
git commit -m <your message>
```
8. Push your changes
```bash 
git push
```

## Secure Imgflip caption API (new)

To avoid exposing Imgflip credentials in the client, the app now uses a serverless function at `/api/caption`.

- Copy `.env.example` to `.env.local` (for local dev) and set these variables:

```
IMGFLIP_USERNAME=your_username
IMGFLIP_PASSWORD=your_password
```

- On Vercel, set the same values in Project Settings → Environment Variables.

Local dev:

```
npm run dev
```

Deploy on Vercel as usual; the function lives at `api/caption.js` and will be auto-deployed.

The frontend `src/Meme.jsx` now posts to `/api/caption` with `template_id` and `boxes` and does not include credentials in the browser.

## Dynamic AI Meme Generator backend

The AI meme generator page (`/dynamic`) talks to a Python Flask backend in `meme-bot/`.

Configure the frontend API base URL:

```
# .env.local
VITE_API_BASE_URL=https://your-flask-backend.example.com
```

Local dev for backend:

```
cd meme-bot
pip install -r requirements.txt
setx GROQ_API_KEY "your_groq_key"  # Windows PowerShell: set for current user
python app.py
```

Then in another terminal:

```
VITE_API_BASE_URL=http://localhost:5000 npm run dev
```

Deploy ideas for the backend:
- Render/Fly.io/Railway (free/low-cost) or any VPS.
- Ensure the service exposes `/api/categories`, `/api/generate`, `/api/random`, `/api/view/:filename`, `/api/download/:filename`.

## Contributing

Contributions are always welcome!

See `contributing.md` for ways to get started.

Please adhere to this project's `code of conduct`.

## License

[MIT](https://choosealicense.com/licenses/mit/)
