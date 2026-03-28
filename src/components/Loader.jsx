import React, { useEffect, useState } from 'react'
import styles from './Loader.module.css'

export default function Loader({ onComplete }) {
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    let val = 0
    const interval = setInterval(() => {
      val += Math.random() * 12 + 4
      if (val >= 100) {
        val = 100
        setProgress(100)
        clearInterval(interval)
        setTimeout(() => {
          setDone(true)
          setTimeout(onComplete, 600)
        }, 400)
      } else {
        setProgress(Math.floor(val))
      }
    }, 80)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`${styles.loader} ${done ? styles.exit : ''}`}>
      <div className={styles.inner}>
        {/* Rocket */}
        <div className={styles.rocketAnim}>
          <svg viewBox="0 0 40 110" width="40" height="110">
            <path d="M20 0 C20 0 30 15 31 32 L9 32 C10 15 20 0 20 0Z" fill="#d0d0d0"/>
            <rect x="9" y="32" width="22" height="55" fill="#c0c0c0" rx="1"/>
            <circle cx="20" cy="50" r="5" fill="#0a1628" stroke="#aaa" strokeWidth="1"/>
            <rect x="9" y="40" width="22" height="2" fill="#e8291c"/>
            <path d="M9 77 L0 95 L9 87 Z" fill="#aaa"/>
            <path d="M31 77 L40 95 L31 87 Z" fill="#bbb"/>
            <path d="M11 87 L9 98 L20 103 L31 98 L29 87 Z" fill="#999"/>
          </svg>
          <div className={styles.loaderFlame} />
        </div>

        <div className={styles.logoText}>MARS 2027</div>
        <div className={styles.subText}>BRINGING THE STORY ONLINE</div>

        <div className={styles.progressWrap}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
          <div className={styles.progressNum}>{progress}%</div>
        </div>

        <div className={styles.statusLine}>
          {progress < 30 && 'PLOTTING THE ARC...'}
          {progress >= 30 && progress < 60 && 'LOCKING COORDINATES...'}
          {progress >= 60 && progress < 90 && 'PRESSURE BUILDING...'}
          {progress >= 90 && 'CURTAIN UP'}
        </div>
      </div>
    </div>
  )
}
