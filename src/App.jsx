import React, { useState, useEffect } from 'react'
import Cursor from './components/Cursor.jsx'
import ProgressBar from './components/ProgressBar.jsx'
import Loader from './components/Loader.jsx'
import Nav from './components/Nav.jsx'
import Hero from './sections/Hero3D.jsx'
import Mission from './sections/Mission.jsx'
import Launch from './sections/Launch.jsx'
import Transit from './sections/Transit.jsx'
import Landing from './sections/Landing.jsx'
import Explore from './sections/Explore.jsx'
import Future from './sections/Future.jsx'
import CinematicAudioShell from './audio/CinematicAudioShell.jsx'

export default function App() {
  const [loaded, setLoaded] = useState(false)

  return (
    <>
      {!loaded && <Loader onComplete={() => setLoaded(true)} />}
      {loaded && (
        <CinematicAudioShell>
          <div className="noise-overlay" />
          <Cursor />
          <ProgressBar />
          <Nav />
          <main>
            <Hero />
            <Mission />
            <Launch />
            <Transit />
            <Landing />
            <Explore />
            <Future />
          </main>
        </CinematicAudioShell>
      )}
    </>
  )
}
