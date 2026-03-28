🚀 MARSBOUND ODYSSEY
A Cinematic Journey Beyond Earth

“This is not a website. It’s a mission you experience.”

🌐 Live Experience

👉 https://marsbound-odyssey.vercel.app/

⚠️ Best experienced on desktop with sound ON for full cinematic immersion

🎬 What is this?

Marsbound Odyssey is an immersive, scroll-driven cinematic web experience that takes users from Earth to Mars — not through pages, but through a continuous narrative journey.

Every scroll drives the story.
Every interaction advances the mission.
Every section is a scene.

🧠 Concept & Vision

Built for the Frontend Odyssey challenge , this project reimagines the web as a storytelling medium, not just an interface.

Instead of static sections, the experience unfolds like a film:

🚀 Ignition → tension builds
🌌 Space → isolation & depth
🔥 Landing → climax & impact
🪐 Exploration → discovery
🌍 Future → humanity evolves

The goal:
👉 Make the user feel the journey — not just see it.

✨ Key Highlights
🎥 Cinematic Storytelling
Continuous scroll-based narrative
Seamless scene transitions (no page breaks)
Emotion-driven progression
🚀 Advanced 3D + Motion
Real-time rocket system with thrust dynamics
Particle systems (smoke, exhaust, dust)
Cinematic camera movement
🌌 Immersive Environment
Parallax starfields
Depth-based motion
Living space atmosphere
🔊 Audio-Driven Experience
Section-based sound design
Launch, transit, landing cues
Ambient immersion
⚡ Micro-interactions
Hover feedback
Interactive exploration cards
Smooth UI responses
🏗️ Tech Stack
⚛️ React + Vite
🎨 Tailwind CSS
🎞️ GSAP + ScrollTrigger
🌐 Three.js + custom shaders
🔊 Web Audio API
🧩 Architecture
🎬 Master GSAP Timeline → Controls narrative flow
🌌 Three.js Scene Engine → 3D visuals + particles
🔊 Central Audio Manager → Sound synchronization
🧠 Component-based UI System → Clean modular structure
🗂️ Project Structure
marsbound-odyssey/
│
├── public/
│   ├── audio/                 # 🎧 Sound assets
│   │   ├── ambient-space.mp3
│   │   ├── rocket-launch.mp3
│   │   └── landing.mp3
│   └── assets/                # Static assets
│
├── src/
│   ├── components/            # 🧩 UI components
│   │   ├── Cursor.jsx
│   │   ├── Loader.jsx
│   │   ├── Nav.jsx
│   │   ├── ProgressBar.jsx
│   │   └── AudioToggle.jsx
│   │
│   ├── sections/              # 🎬 Story scenes
│   │   ├── Hero3D.jsx
│   │   ├── Mission.jsx
│   │   ├── Launch.jsx
│   │   ├── Transit.jsx
│   │   ├── Landing.jsx
│   │   ├── Explore.jsx
│   │   └── Future.jsx
│   │
│   ├── animation/             # 🎞️ GSAP logic
│   │   └── masterTimeline.js
│   │
│   ├── hooks/                 # ⚙️ Three.js logic
│   │   └── useHeroThreeScene.js
│   │
│   ├── audio/                 # 🔊 Audio system
│   │   └── cinematicAudio.js
│   │
│   ├── styles/                # 🎨 Global styles
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── package.json
├── vite.config.js
└── README.md
🧠 Architecture Flow
User Scroll → GSAP ScrollTrigger → Master Timeline  
→ Three.js Scene Updates → UI Sections Sync  
→ Audio System Sync → Cinematic Output
🎮 Controls
🖱️ Scroll → Progress the journey
🖱️ Hover → Interact with elements
🔊 Toggle → Enable/disable sound
⚡ Performance Focus
Optimized animations (transform-based)
Reduced re-renders using refs
Mobile fallbacks for heavy 3D scenes
🏆 Why This Stands Out

✔️ Not a website — a cinematic experience
✔️ Combines storytelling + engineering + design
✔️ Real-time 3D instead of static animations
✔️ Built under hackathon constraints

🚀 Getting Started
npm install
npm run dev
🌍 Vision

The future of the web is not static pages.

It is:

interactive
emotional
immersive

Marsbound Odyssey is a step toward that future.

👨‍🚀 Final Note

“The journey to Mars is not about distance.
It’s about what we become along the way.”
