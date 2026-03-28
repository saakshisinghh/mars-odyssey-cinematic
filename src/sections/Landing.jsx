import React, { useEffect, useRef, useState } from 'react'
import { onLandingApproach, onLandingTouchdown } from '../audio/cinematicSoundManager.js'
import styles from './Landing.module.css'

export default function Landing() {
  const landingApproachDone = useRef(false)
  const sectionRef = useRef(null)
  const [visible, setVisible] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [landed, setLanded] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setVisible(true)
        if (!landingApproachDone.current) {
          landingApproachDone.current = true
          onLandingApproach()
        }
        let c = 60
        const interval = setInterval(() => {
          c -= 1
          setCountdown(c)
          if (c <= 0) {
            clearInterval(interval)
            setLanded(true)
          }
        }, 80)
        observer.disconnect()
        return () => clearInterval(interval)
      }
    }, { threshold: 0.2 })
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (landed) onLandingTouchdown()
  }, [landed])

  return (
    <section id="landing" className={styles.landing} ref={sectionRef}>
      <div className={styles.marsSurface} />
      <div className={styles.atmosphere} />
      <div className={styles.dustVeil} />

      <div className={styles.container}>
        {/* Left: countdown + landing animation */}
        <div className={`${styles.left} ${visible ? styles.visible : ''}`}>
          {!landed ? (
            <div className={styles.countdownWrap}>
              <div className={styles.countLabel}>SURFACE IN</div>
              <div className={styles.countMain}>
                T-MINUS <span className={styles.countNum}>{countdown}</span> SEC
              </div>
              <div className={styles.altimeter}>
                <div className={styles.altLabel}>ALTITUDE</div>
                <div className={styles.altBar}>
                  <div
                    className={styles.altFill}
                    style={{ height: `${(countdown / 60) * 100}%` }}
                  />
                </div>
                <div className={styles.altValue}>{Math.round(countdown * 120)}m</div>
              </div>
              <div className={styles.enginesLabel}>DESCENT ENGINES ACTIVE</div>
              <div className={styles.enginesGrid}>
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className={`${styles.engine} ${styles.engineActive}`} />
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.touchdownMsg}>
              <div className={styles.tdLine}>WE ARE HERE</div>
              <div className={styles.tdSub}>JEZERO CRATER · MARS</div>
              <div className={styles.tdCoords}>18.4°N 77.7°E</div>
              <div className={styles.tdStatus}>
                <span className={styles.statusDot} />
                ALL SYSTEMS NOMINAL
              </div>
            </div>
          )}
        </div>

        {/* Right: narrative */}
        <div className={`${styles.right} ${visible ? styles.visible : ''}`}>
          <span className="red-line" />
          <span className={styles.overline}>THE SEVEN MINUTES · NO DO-OVERS</span>
          <h2 className={styles.heading}>
            FROM INFERNO<br />
            <span>TO DUST</span>
          </h2>
          <p className={styles.body}>
            Months of silence end in violence: twenty thousand kilometers an hour to zero —
            parachutes, engines, algorithms, prayer. The world holds its breath. The crew holds theirs longer.
          </p>
          <p className={styles.body}>
            Jezero: an old river’s ghost, a bowl of questions. If anything ever lived on Mars,
            the delta might still remember. You don’t land here for the view — you land for the answer.
          </p>

          <div className={styles.specs}>
            {[
              { label: 'ENTRY VELOCITY', value: '20,000 km/h' },
              { label: 'TOUCHDOWN SPEED', value: '< 3 km/h' },
              { label: 'LANDING ZONE', value: 'Jezero Crater' },
              { label: 'SURFACE TEMP', value: '-60°C avg' },
            ].map((s, i) => (
              <div className={styles.spec} key={i}>
                <span className={styles.specVal}>{s.value}</span>
                <span className={styles.specLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
