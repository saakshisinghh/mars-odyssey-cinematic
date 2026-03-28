# 🚀 MARSBOUND ODYSSEY  
### A Cinematic Journey Beyond Earth

> This is not a website. It’s a mission you experience.

---

## 🌐 Live Demo
👉 https://marsbound-odyssey.vercel.app/

⚠️ Best experienced on desktop with sound ON

---

## 🎬 Overview

Marsbound Odyssey is a scroll-driven cinematic web experience that takes users from Earth to Mars through a continuous narrative.

Every scroll advances the story.  
Every section is a scene.

---

## 🧠 Concept & Vision

Built for the Frontend Odyssey challenge, this project explores the web as a storytelling medium.

Instead of static pages, the experience unfolds like a film:

- Ignition → tension builds  
- Space → isolation & depth  
- Landing → climax & impact  
- Exploration → discovery  
- Future → humanity evolves  

**Goal:** Make users feel the journey — not just see it.

---

## ✨ Key Highlights

### 🎥 Cinematic Storytelling
- Continuous scroll-based narrative  
- Seamless transitions between sections  
- Emotion-driven progression  

### 🚀 3D & Motion
- Real-time rocket animation  
- Particle systems (smoke, exhaust, dust)  
- Camera-based movement  

### 🌌 Immersion
- Parallax starfields  
- Depth-based motion  
- Dynamic environment  

### 🔊 Audio
- Section-based sound design  
- Ambient + event-driven audio  

---

## 🏗️ Tech Stack

- React + Vite  
- Tailwind CSS  
- GSAP + ScrollTrigger  
- Three.js  
- Web Audio API  

---

## 🗂️ Project Structure

```bash
marsbound-odyssey/
│
├── public/
│   ├── audio/                      # 🔊 Sound assets
│   │   ├── ambient-space.mp3
│   │   ├── rocket-launch.mp3
│   │   └── landing.mp3
│   │
│   ├── assets/                     # 🖼️ Images / textures
│   │   ├── stars.png
│   │   ├── mars-texture.jpg
│   │   └── ui-elements/
│   │
│   └── favicon.ico
│
├── src/
│   │
│   ├── components/                 # 🧩 Reusable UI components
│   │   ├── Cursor.jsx
│   │   ├── Loader.jsx
│   │   ├── Nav.jsx
│   │   ├── ProgressBar.jsx
│   │   ├── AudioToggle.jsx
│   │   └── StarField.jsx
│   │
│   ├── sections/                   # 🎬 Story sections (scenes)
│   │   ├── Hero3D.jsx
│   │   ├── Mission.jsx
│   │   ├── Launch.jsx
│   │   ├── Transit.jsx
│   │   ├── Landing.jsx
│   │   ├── Explore.jsx
│   │   └── Future.jsx
│   │
│   ├── animation/                  # 🎞️ GSAP animation logic
│   │   ├── masterTimeline.js
│   │   └── scrollController.js
│   │
│   ├── hooks/                      # ⚙️ Custom hooks
│   │   ├── useHeroThreeScene.js
│   │   ├── useScrollProgress.js
│   │   └── useAudio.js
│   │
│   ├── audio/                      # 🔊 Audio system
│   │   ├── cinematicAudio.js
│   │   └── audioManager.js
│   │
│   ├── styles/                     # 🎨 Styling
│   │   ├── globals.css
│   │   ├── variables.css
│   │   └── animations.css
│   │
│   ├── utils/                      # 🛠️ Helper functions
│   │   ├── math.js
│   │   ├── easing.js
│   │   └── constants.js
│   │
│   ├── App.jsx                     # Main app component
│   └── main.jsx                    # Entry point
│
├── .gitignore
├── package.json
├── vite.config.js
└── README.md
```

---

## 🧠 Architecture

```
User Scroll  
   ↓
GSAP ScrollTrigger  
   ↓
Master Timeline  
   ↓
Three.js Scene Updates  
   ↓
UI Sections Sync  
   ↓
Audio System Sync  
   ↓
Cinematic Output
```

---

## 🎮 Controls

- Scroll → progress story  
- Hover → interact  
- Sound toggle → control audio  

---

## ⚡ Performance

- Optimized animations (transform-based)  
- Minimal re-renders using refs  
- Mobile fallback for heavy 3D  

---

## 🏆 Why This Project

- Cinematic storytelling approach  
- Real-time 3D + particles  
- Strong animation + interaction design  
- Built under hackathon constraints  

---

## 🚀 Setup

```bash
npm install
npm run dev
```

---

## 🌍 Final Note

The journey to Mars is not about distance.  
It’s about what we become along the way.
