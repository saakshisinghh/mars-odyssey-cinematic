import React, { useEffect, useRef, useState } from 'react'
import styles from './Hero3D.module.css'
import { useHeroThreeScene } from '../hooks/useHeroThreeScene.js'

/* ─── Mobile fallback ────────────────────────────────────────── */
function MobileHero({ onLaunch, phase, countdown }) {
  return (
    <section id="hero" className={styles.hero}>
      <div className={styles.mobileStars} />
      <div className={styles.mobilePlanet} />
      <div className={styles.mobileRocketWrap}>
        <div className={`${styles.mobileRocket} ${(phase==='launch'||phase==='warp') ? styles.mobileRocketLaunch : ''}`}>
          <svg viewBox="0 0 80 180" width="80" height="180" fill="none">
            <path d="M40 0 C40 0 58 28 60 58 L20 58 C22 28 40 0 40 0Z" fill="#d0d0d0"/>
            <rect x="20" y="58" width="40" height="80" fill="#c4c4c4" rx="2"/>
            <circle cx="40" cy="82" r="10" fill="#0a1628" stroke="#aaa" strokeWidth="1.5"/>
            <rect x="20" y="72" width="40" height="3" fill="#e8291c"/>
            <path d="M20 118 L4 148 L20 136 Z" fill="#b0b0b0"/>
            <path d="M60 118 L76 148 L60 136 Z" fill="#b8b8b8"/>
            <rect x="22" y="138" width="36" height="20" fill="#999" rx="2"/>
          </svg>
          {(phase==='ignite'||phase==='launch'||phase==='warp') && (
            <div className={styles.mobileFlame}><div className={styles.mobileFlameInner} /></div>
          )}
        </div>
      </div>
      <div className={`${styles.heroText} ${(phase==='launch'||phase==='warp'||phase==='orbit') ? styles.textFade : ''}`}>
        <div className={styles.eyebrow}><span className={styles.dot} /><span>ARTEMIS · WHEN EARTH ISN’T ENOUGH</span></div>
        <h1 className={styles.title}>
          <span className={styles.line1}>JOURNEY</span><br />
          <span className={styles.line2}>TO</span><br />
          <span className={styles.line3}>MARS</span>
        </h1>
        <p className={styles.subtitle}>Something in us always looks up.<br />This time, we don’t stop at the sky.</p>
        <div className={styles.launchControl}>
          {phase==='idle' && <button className={styles.launchBtn} onClick={onLaunch}><span className={styles.btnPulse}/>INITIATE LAUNCH SEQUENCE</button>}
          {phase==='counting' && <div className={styles.countdownDisplay}><span className={styles.countLabel}>T-MINUS</span><span className={styles.countNum}>{countdown}</span><span className={styles.countLabel}>SECONDS</span></div>}
          {phase==='ignite' && <div className={styles.igniteMsg}>IGNITION</div>}
          {(phase==='launch'||phase==='warp') && <div className={styles.liftoffMsg}>LIFTOFF</div>}
        </div>
      </div>
      <div className={styles.dataStrip}>
        {[{label:'DISTANCE',value:'54.6M KM'},{label:'DURATION',value:'7 MONTHS'},{label:'CREW',value:'6 ASTRONAUTS'},{label:'MISSION',value:'ARTEMIS-M1'}].map((d,i) => (
          <React.Fragment key={i}>{i>0&&<div className={styles.divider}/>}<div className={styles.dataItem}><span className={styles.dataLabel}>{d.label}</span><span className={styles.dataValue}>{d.value}</span></div></React.Fragment>
        ))}
      </div>
    </section>
  )
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function Hero3D() {
  const mountRef      = useRef(null)
  const heroRocketRef = useRef(null)
  const stateRef      = useRef({})
  const [phase, setPhase] = useState('idle')
  const [countdown, setCountdown] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  const phaseRef  = useRef('idle')

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768 || /Mobi|Android/i.test(navigator.userAgent))
    check(); window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // setPhaseSync: single source of truth — updates BOTH phaseRef (read by tick loop)
  // and React state (drives UI). Without this, phase changes are invisible to the tick loop.
  const setPhaseSync = (p) => { phaseRef.current = p; setPhase(p) }

  // Wire tick loop (useHeroThreeScene) to phase — refs live on stateRef object, not .current
  stateRef.phaseRef = phaseRef
  stateRef.setPhaseSync = setPhaseSync

  const startLaunch = () => {
    if (phaseRef.current !== 'idle') return
    setPhaseSync('counting')
    let count = 10; setCountdown(count)
    const iv = setInterval(() => {
      count--; setCountdown(count)
      if (count <= 0) {
        clearInterval(iv)
        setPhaseSync('ignite')
      }
    }, 500)
  }

  const resetMission = () => {
    phaseRef.current = 'idle'; setPhase('idle'); setCountdown(null)
    const s = stateRef.current
    if (s.rocket)    { s.rocket.position.set(0,0,0); s.rocket.scale.setScalar(1); s.rocket.rotation.set(0,0,0) }
    if (s.camera)    {
      s.camera.position.set(0, 0.4, 3.8)
      if (s.camState) {
        s.camState.x = 0; s.camState.y = 0.4; s.camState.z = 3.8
        s.camState.velX.v = 0; s.camState.velY.v = 0; s.camState.velZ.v = 0
        s.camState.lookCur = 0.2; s.camState.velLook.v = 0
        s.camState.targetX = 0; s.camState.targetY = 0.4; s.camState.targetZ = 3.8
        s.camState.lookTarget = 0.2
      }
    }
    if (s.warpStars) { s.warpStars.material.uniforms.uWarp.value = 0 }
    if (s.engineLight) { s.engineLight.intensity = 0 }
    s.launchTime = null
    s.warpTriggered = false
  }

  useHeroThreeScene(mountRef, isMobile, heroRocketRef, stateRef)

  if (isMobile) return <MobileHero onLaunch={startLaunch} phase={phase} countdown={countdown} />

  return (
    <section id="hero" className={styles.hero}>
      <div ref={mountRef} className={styles.canvas} />
      <div className={styles.scanlines} />
      <div className={styles.vignette} />

      <div className={`${styles.heroText} ${(phase==='launch'||phase==='warp'||phase==='orbit') ? styles.textFade : ''}`}>
        <div className={styles.eyebrow}><span className={styles.dot} /><span>ARTEMIS · WHEN EARTH ISN’T ENOUGH</span></div>
        <h1 className={styles.title}>
          <span className={styles.line1}>JOURNEY</span><br />
          <span className={styles.line2}>TO</span><br />
          <span className={styles.line3}>MARS</span>
        </h1>
        <p className={styles.subtitle}>Something in us always looks up.<br />This time, we don’t stop at the sky.</p>

        <div className={styles.launchControl}>
          {phase==='idle' && (
            <button className={styles.launchBtn} onClick={startLaunch}>
              <span className={styles.btnPulse}/>INITIATE LAUNCH SEQUENCE
            </button>
          )}
          {phase==='counting' && (
            <div className={styles.countdownDisplay}>
              <span className={styles.countLabel}>T-MINUS</span>
              <span className={styles.countNum}>{countdown}</span>
              <span className={styles.countLabel}>SECONDS</span>
            </div>
          )}
          {phase==='ignite' && <div className={styles.igniteMsg}>IGNITION</div>}
          {(phase==='launch'||phase==='warp') && <div className={styles.liftoffMsg}>LIFTOFF</div>}
          {phase==='orbit' && <button className={styles.resetBtn} onClick={resetMission}>↺ RESET MISSION</button>}
        </div>
      </div>

      {(phase==='warp'||phase==='orbit') && <div className={styles.warpOverlay}/>}
      {(phase==='launch'||phase==='warp') && <div className={styles.shockwaveRing}/>}
      {(phase==='ignite'||phase==='launch'||phase==='warp') && <div className={styles.letterboxTop}/>}
      {(phase==='ignite'||phase==='launch'||phase==='warp') && <div className={styles.letterboxBottom}/>}
      {phase==='launch' && <div className={styles.liftoffBloom}/>}
      {phase==='ignite' && <div className={styles.heatHaze}/>}

      <div className={styles.dataStrip}>
        {[{label:'DISTANCE',value:'54.6M KM'},{label:'DURATION',value:'7 MONTHS'},{label:'CREW',value:'6 ASTRONAUTS'},{label:'MISSION',value:'ARTEMIS-M1'}].map((d,i) => (
          <React.Fragment key={i}>{i>0&&<div className={styles.divider}/>}<div className={styles.dataItem}><span className={styles.dataLabel}>{d.label}</span><span className={styles.dataValue}>{d.value}</span></div></React.Fragment>
        ))}
      </div>

      <div className={styles.scrollIndicator}><div className={styles.scrollLine}/><span>SCROLL</span></div>
    </section>
  )
}
