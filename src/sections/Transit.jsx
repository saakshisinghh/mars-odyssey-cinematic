import React, { useEffect, useRef, useState } from 'react'
import StarField from '../components/StarField.jsx'
import styles from './Transit.module.css'
import gsap from 'gsap'
import { onTransitSectionVisible, tryTransitDeepSilenceMoment } from '../audio/cinematicSoundManager.js'

const challenges = [
  { icon: '☢', title: 'Invisible Fire', detail: 'Past the magnetosphere, radiation doesn’t roar — it accumulates. Water walls and storm shelters are the only armor between the crew and the sky.', stat: '~600 mSv', statLabel: 'Mission dose' },
  { icon: '⚖', title: 'Your Body Forgets Home', detail: 'Months without weight: bones thin, muscles forget how to stand. Two and a half hours a day of work — just to remain human.', stat: '1–2%', statLabel: 'Bone loss / month' },
  { icon: '🧠', title: 'The 22-Minute Silence', detail: 'A question asked. Half an hour until the answer. No one is coming to help. The ship must think for itself — and hold six minds together.', stat: '22 MIN', statLabel: 'One-way comm' },
  { icon: '🌡', title: 'Hot and Cold Beyond Measure', detail: 'Outside: furnace and cryo in the same orbit. Inside: a fragile 21°C bubble of air — engineering pretending the universe isn’t trying to kill it.', stat: '-270°C', statLabel: 'Deep space' },
]

export default function Transit() {
  const transitAudioStarted = useRef(false)
  const sectionRef   = useRef(null)
  const parallaxRef  = useRef(null)
  const shipRef      = useRef(null)
  const astronautRef = useRef(null)
  const [visible, setVisible]             = useState(false)
  const [activeChallenge, setActiveChallenge] = useState(0)
  const [scrollProgress, setScrollProgress]   = useState(0)
  const [scrollDriveCards, setScrollDriveCards] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 768
  )
  const touchStartX = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setVisible(true)
        if (!transitAudioStarted.current) {
          transitAudioStarted.current = true
          onTransitSectionVisible()
        }
      }
    }, { threshold: 0.1 })
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  // Floating astronaut loop via GSAP
  useEffect(() => {
    if (!astronautRef.current) return
    const tl = gsap.timeline({ repeat: -1, yoyo: true, ease: 'sine.inOut' })
    tl.to(astronautRef.current, { y: -18, rotation: 8, duration: 3.2 })
      .to(astronautRef.current, { y: -8, rotation: -4, duration: 2.5 })
      .to(astronautRef.current, { y: -22, rotation: 5, duration: 3.8 })
    return () => tl.kill()
  }, [])

  useEffect(() => {
    const onResize = () => setScrollDriveCards(window.innerWidth >= 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const el = sectionRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const sectionH = el.offsetHeight
      const viewH = window.innerHeight
      const raw = 1 - (rect.bottom / (sectionH + viewH))
      const progress = Math.max(0, Math.min(1, raw))
      setScrollProgress(progress)
      tryTransitDeepSilenceMoment(progress)

      if (parallaxRef.current) {
        parallaxRef.current.style.transform = `translateY(${progress * -80}px)`
      }
      if (shipRef.current) {
        const shipX = 30 + progress * 600
        const shipY = 100 + Math.sin(progress * Math.PI) * -50
        shipRef.current.setAttribute('cx', shipX)
        shipRef.current.setAttribute('cy', shipY)
        const ringEl = shipRef.current.nextSibling
        if (ringEl) { ringEl.setAttribute('cx', shipX); ringEl.setAttribute('cy', shipY) }
        const labelEl = ringEl?.nextSibling
        if (labelEl) { labelEl.setAttribute('x', shipX); labelEl.setAttribute('y', shipY - 14) }
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!scrollDriveCards) return
    const idx = Math.min(3, Math.floor(scrollProgress * 5))
    setActiveChallenge(idx)
  }, [scrollProgress, scrollDriveCards])

  const onChallengeTouchStart = (e) => {
    if (window.innerWidth >= 768) return
    touchStartX.current = e.touches[0]?.clientX ?? null
  }
  const onChallengeTouchEnd = (e) => {
    if (window.innerWidth >= 768) return
    const start = touchStartX.current
    touchStartX.current = null
    if (start == null) return
    const end = e.changedTouches[0]?.clientX
    if (end == null) return
    const dx = end - start
    if (Math.abs(dx) < 48) return
    if (dx < 0) setActiveChallenge((i) => Math.min(3, i + 1))
    else setActiveChallenge((i) => Math.max(0, i - 1))
  }

  const onChallengeKeyDown = (e, i) => {
    if (e.key !== 'Enter' && e.key !== ' ') return
    e.preventDefault()
    setActiveChallenge(i)
  }

  const distanceCovered = Math.round(scrollProgress * 54.6)
  const daysElapsed     = Math.round(scrollProgress * 210)

  return (
    <section id="transit" className={styles.transit} ref={sectionRef}>
      <div ref={parallaxRef} className={styles.starLayer}>
        <StarField count={400} warp={visible} speed={visible ? 1.5 : 0} />
      </div>

      {/* Floating astronaut */}
      <div ref={astronautRef} className={styles.astronautWrap} style={{ opacity: visible ? 1 : 0, transition: 'opacity 1.5s ease 0.5s' }}>
        <svg viewBox="0 0 80 100" width="80" height="100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="40" cy="20" rx="18" ry="18" fill="#d8d8d8" stroke="#aaa" strokeWidth="1"/>
          <circle cx="40" cy="20" r="12" fill="#0a1628"/>
          <ellipse cx="35" cy="17" rx="4" ry="3" fill="rgba(255,255,255,0.15)"/>
          <rect x="24" y="36" width="32" height="35" rx="6" fill="#c8c8c8"/>
          <rect x="28" y="40" width="24" height="16" rx="2" fill="#1a2a4a"/>
          <rect x="30" y="42" width="9" height="4" rx="1" fill="#e8291c" opacity="0.8"/>
          <rect x="41" y="42" width="9" height="4" rx="1" fill="#4488ff" opacity="0.8"/>
          <rect x="24" y="38" width="8" height="22" rx="4" fill="#bbb" transform="rotate(-15 28 49)"/>
          <rect x="48" y="38" width="8" height="22" rx="4" fill="#bbb" transform="rotate(15 52 49)"/>
          <rect x="28" y="68" width="10" height="20" rx="4" fill="#bbb" transform="rotate(5 33 78)"/>
          <rect x="42" y="68" width="10" height="20" rx="4" fill="#bbb" transform="rotate(-5 47 78)"/>
          {/* Jetpack glow */}
          <ellipse cx="40" cy="71" rx="14" ry="3" fill="rgba(100,180,255,0.2)" style={{filter:'blur(2px)'}}/>
        </svg>
      </div>

      {/* Trajectory */}
      <svg className={styles.trajectory} viewBox="0 0 1200 200" preserveAspectRatio="none">
        <path d="M 30,100 Q 300,20 600,100 T 1170,80" fill="none" stroke="rgba(232,41,28,0.15)" strokeWidth="1" strokeDasharray="6 4"/>
        <path d="M 30,100 Q 300,20 600,100 T 1170,80" fill="none" stroke="rgba(232,41,28,0.55)" strokeWidth="1.5" strokeDasharray={`${scrollProgress * 1400} 9999`} className={styles.trajPath}/>
        <circle cx="30" cy="100" r="20" fill="#1a3a6e"/>
        <circle cx="30" cy="100" r="20" fill="none" stroke="rgba(100,150,255,0.4)" strokeWidth="1"/>
        <text x="30" y="130" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9" fontFamily="Barlow Condensed">EARTH</text>
        <circle cx="1170" cy="80" r="18" fill="#8b2e0e"/>
        <circle cx="1170" cy="80" r="18" fill="none" stroke="rgba(193,68,14,0.4)" strokeWidth="1"/>
        <text x="1170" y="110" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9" fontFamily="Barlow Condensed">MARS</text>
        <circle ref={shipRef} cx="30" cy="100" r="5" fill="white"/>
        <circle cx="30" cy="100" r="9" fill="none" stroke="rgba(232,41,28,0.6)" strokeWidth="1" className={styles.shipPing}/>
        <text x="30" y="86" textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="7" fontFamily="Barlow Condensed">ARTEMIS-M1</text>
      </svg>

      {/* Telemetry */}
      <div className={styles.telemetry}>
        <div className={styles.telItem}>
          <span className={styles.telLabel}>DISTANCE COVERED</span>
          <span className={styles.telVal}>{distanceCovered.toFixed(1)}M KM</span>
        </div>
        <div className={styles.telDivider}/>
        <div className={styles.telItem}>
          <span className={styles.telLabel}>DAYS ELAPSED</span>
          <span className={styles.telVal}>SOL {daysElapsed}</span>
        </div>
        <div className={styles.telDivider}/>
        <div className={styles.telItem}>
          <span className={styles.telLabel}>MISSION STATUS</span>
          <span className={styles.telVal}><span className="live-dot"/>NOMINAL</span>
        </div>
        <div className={styles.telDivider}/>
        <div className={styles.telItem}>
          <span className={styles.telLabel}>VELOCITY</span>
          <span className={styles.telVal}>39,600 KM/H</span>
        </div>
      </div>

      <div className={styles.container}>
        <div className={`${styles.header} ${visible ? styles.visible : ''}`}>
          <span className="red-line"/>
          <span className={styles.overline}>THE VOID · MID-JOURNEY</span>
          <h2 className={styles.heading}>EARTH IS A<br /><span>MEMORY</span></h2>
          <p className={styles.sub}>
            Seven months. No shore. No rescue. Only a thin hull, a thread of radio,
            and six people who chose to become smaller than the dark.
          </p>
          <div className={styles.journeyBar}>
            <div className={styles.journeyLabel}>DISTANCE FROM HOME</div>
            <div className={styles.journeyTrack}>
              <div className={styles.journeyFill} style={{ width: `${scrollProgress * 100}%` }}/>
            </div>
            <div className={styles.journeyPct}>{Math.round(scrollProgress * 100)}%</div>
          </div>
        </div>

        <div
          className={styles.challenges}
          onTouchStart={onChallengeTouchStart}
          onTouchEnd={onChallengeTouchEnd}
        >
          {challenges.map((c, i) => (
            <div
              key={i}
              role="button"
              tabIndex={0}
              className={`${styles.card} ${activeChallenge === i ? styles.cardActive : ''} ${visible ? styles.cardVisible : ''}`}
              style={{ transitionDelay: `${0.1 + i * 0.1}s` }}
              onClick={() => setActiveChallenge(i)}
              onKeyDown={(e) => onChallengeKeyDown(e, i)}
            >
              <div className={styles.cardIcon}>{c.icon}</div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{c.title}</h3>
                <p className={styles.cardDetail}>{c.detail}</p>
                <div className={styles.cardStat}>
                  <span className={styles.cardStatVal}>{c.stat}</span>
                  <span className={styles.cardStatLabel}>{c.statLabel}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
