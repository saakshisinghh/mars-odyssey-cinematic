import React, { useEffect, useRef, useState } from 'react'
import StarField from '../components/StarField.jsx'
import styles from './Hero.module.css'

export default function Hero() {
  const rocketRef = useRef(null)
  const exhaustRef = useRef(null)
  const [launched, setLaunched] = useState(false)
  const [countdown, setCountdown] = useState(null)
  const [launchPhase, setLaunchPhase] = useState('idle') // idle | counting | ignite | launch | orbit
  const heroRef = useRef(null)

  // Parallax on scroll
  useEffect(() => {
    const onScroll = () => {
      if (!heroRef.current) return
      const scrollY = window.scrollY
      const bg = heroRef.current.querySelector(`.${styles.bg}`)
      if (bg) bg.style.transform = `translateY(${scrollY * 0.4}px)`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const startLaunch = () => {
    if (launchPhase !== 'idle') return
    setLaunchPhase('counting')
    let count = 10
    setCountdown(count)

    const interval = setInterval(() => {
      count--
      setCountdown(count)
      if (count <= 0) {
        clearInterval(interval)
        setLaunchPhase('ignite')
        setTimeout(() => setLaunchPhase('launch'), 800)
        setTimeout(() => {
          setLaunched(true)
          setLaunchPhase('orbit')
          // scroll to next section
          setTimeout(() => {
            document.getElementById('mission')?.scrollIntoView({ behavior: 'smooth' })
          }, 1200)
        }, 3500)
      }
    }, 500)
  }

  return (
    <section id="hero" className={styles.hero} ref={heroRef}>
      <div className={styles.bg} />

      {/* Stars */}
      <StarField count={300} />

      {/* Distant planets */}
      <div className={styles.earthGlow} />
      <div className={styles.marsOrb} />

      {/* Grid overlay */}
      <div className={styles.grid} />

      {/* Rocket assembly */}
      <div
        className={`${styles.rocketWrap} ${launchPhase === 'launch' ? styles.launching : ''} ${launched ? styles.gone : ''}`}
        ref={rocketRef}
      >
        {/* Exhaust / fire */}
        <div className={`${styles.exhaust} ${launchPhase === 'ignite' || launchPhase === 'launch' ? styles.exhaustActive : ''}`}>
          <div className={styles.flame1} />
          <div className={styles.flame2} />
          <div className={styles.flame3} />
          <div className={styles.flameCore} />
          {/* Smoke rings */}
          {(launchPhase === 'ignite' || launchPhase === 'launch') && (
            <>
              <div className={styles.smoke1} />
              <div className={styles.smoke2} />
              <div className={styles.smoke3} />
            </>
          )}
        </div>

        {/* Rocket SVG */}
        <svg
          className={styles.rocket}
          viewBox="0 0 80 220"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Nose cone */}
          <path d="M40 0 C40 0 58 30 62 65 L18 65 C22 30 40 0 40 0Z" fill="#d8d8d8" />
          <path d="M40 0 C40 0 50 30 52 65 L40 65 Z" fill="#ebebeb" />
          {/* Body */}
          <rect x="18" y="65" width="44" height="110" fill="#c8c8c8" rx="2" />
          <rect x="40" y="65" width="22" height="110" fill="#d8d8d8" rx="2" />
          {/* Windows */}
          <circle cx="40" cy="100" r="8" fill="#0a1628" stroke="#aaa" strokeWidth="1.5" />
          <circle cx="40" cy="100" r="5" fill="#0d1f3c" />
          <circle cx="38" cy="98" r="2" fill="rgba(255,255,255,0.3)" />
          {/* MARS text on body */}
          <text x="40" y="140" textAnchor="middle" fill="rgba(0,0,0,0.4)" fontSize="7" fontFamily="Barlow Condensed" fontWeight="700" letterSpacing="1">MARS</text>
          <text x="40" y="150" textAnchor="middle" fill="rgba(0,0,0,0.3)" fontSize="5" fontFamily="Barlow Condensed" letterSpacing="0.5">2027</text>
          {/* Red accent stripe */}
          <rect x="18" y="80" width="44" height="4" fill="#e8291c" opacity="0.9" />
          {/* Grid lines */}
          <line x1="18" y1="110" x2="62" y2="110" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
          <line x1="18" y1="130" x2="62" y2="130" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
          <line x1="18" y1="150" x2="62" y2="150" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
          {/* Fins */}
          <path d="M18 155 L0 190 L18 175 Z" fill="#b0b0b0" />
          <path d="M62 155 L80 190 L62 175 Z" fill="#c0c0c0" />
          <path d="M22 155 L8 185 L22 172 Z" fill="#c8c8c8" />
          <path d="M58 155 L72 185 L58 172 Z" fill="#b8b8b8" />
          {/* Engine bell */}
          <path d="M22 175 L18 195 L40 205 L62 195 L58 175 Z" fill="#a0a0a0" />
          <path d="M26 175 L22 192 L40 200 L58 192 L54 175 Z" fill="#b8b8b8" />
          <ellipse cx="40" cy="200" rx="18" ry="5" fill="#888" />
          <ellipse cx="40" cy="200" rx="12" ry="3.5" fill="#555" />
          <ellipse cx="40" cy="200" rx="6" ry="2" fill="#222" />
        </svg>

        {/* Launch pad */}
        {launchPhase === 'idle' || launchPhase === 'counting' ? (
          <div className={styles.launchPad}>
            <div className={styles.padArm1} />
            <div className={styles.padArm2} />
            <div className={styles.padBase} />
          </div>
        ) : null}
      </div>

      {/* Hero text */}
      <div className={`${styles.heroText} ${launched ? styles.textFade : ''}`}>
        <div className={styles.eyebrow}>
          <span className={styles.dot} />
          <span>SPACE MISSION 2027</span>
        </div>
        <h1 className={styles.title}>
          <span className={styles.titleLine1}>JOURNEY</span>
          <br />
          <span className={styles.titleLine2}>TO</span>
          <br />
          <span className={styles.titleLine3}>MARS</span>
        </h1>
        <p className={styles.subtitle}>
          The mission of a lifetime begins here.<br />
          54.6 million kilometers. One giant leap.
        </p>

        {/* Launch control */}
        <div className={styles.launchControl}>
          {launchPhase === 'idle' && (
            <button className={styles.launchBtn} onClick={startLaunch}>
              <span className={styles.btnPulse} />
              INITIATE LAUNCH SEQUENCE
            </button>
          )}
          {launchPhase === 'counting' && (
            <div className={styles.countdownDisplay}>
              <span className={styles.countLabel}>T-MINUS</span>
              <span className={styles.countNum}>{countdown}</span>
              <span className={styles.countLabel}>SECONDS</span>
            </div>
          )}
          {launchPhase === 'ignite' && (
            <div className={styles.igniteMsg}>
              <span>IGNITION</span>
            </div>
          )}
          {(launchPhase === 'launch' || launchPhase === 'orbit') && (
            <div className={styles.liftoffMsg}>
              <span>LIFTOFF</span>
            </div>
          )}
        </div>
      </div>

      {/* Data strip */}
      <div className={styles.dataStrip}>
        <div className={styles.dataItem}>
          <span className={styles.dataLabel}>DISTANCE</span>
          <span className={styles.dataValue}>54.6M KM</span>
        </div>
        <div className={styles.dataDivider} />
        <div className={styles.dataItem}>
          <span className={styles.dataLabel}>DURATION</span>
          <span className={styles.dataValue}>7 MONTHS</span>
        </div>
        <div className={styles.dataDivider} />
        <div className={styles.dataItem}>
          <span className={styles.dataLabel}>CREW</span>
          <span className={styles.dataValue}>6 ASTRONAUTS</span>
        </div>
        <div className={styles.dataDivider} />
        <div className={styles.dataItem}>
          <span className={styles.dataLabel}>MISSION</span>
          <span className={styles.dataValue}>ARTEMIS-M1</span>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className={styles.scrollIndicator}>
        <div className={styles.scrollLine} />
        <span>SCROLL</span>
      </div>
    </section>
  )
}
