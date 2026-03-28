import React, { useEffect, useRef, useState } from 'react'
import StarField from '../components/StarField.jsx'
import gsap from 'gsap'
import styles from './Future.module.css'

const milestones = [
  { year: '2027', label: 'Boots on red ground', done: true },
  { year: '2029', label: 'A roof that stays', done: false },
  { year: '2032', label: 'First cry on Mars', done: false },
  { year: '2040', label: 'Ten thousand names', done: false },
  { year: '2060', label: 'We teach the sky', done: false },
  { year: '2100', label: 'A second home', done: false },
]

export default function Future() {
  const sectionRef = useRef(null)
  const lastMileRef = useRef(null)
  const finaleRef = useRef(null)
  const finalePlayed = useRef(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const el = lastMileRef.current
    const ov = finaleRef.current
    if (!el || !ov) return
    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || finalePlayed.current) return
        finalePlayed.current = true
        const title = ov.querySelector('[data-finale-title]')
        const sub = ov.querySelector('[data-finale-sub]')
        gsap.set(ov, { opacity: 0 })
        gsap.set(title, { opacity: 0 })
        gsap.set(sub, { opacity: 0 })
        const tl = gsap.timeline()
        tl.to(ov, { opacity: 1, duration: 0.7, ease: 'power2.out' })
        tl.to(title, { opacity: 1, duration: 1.1, ease: 'power2.out' }, '-=0.35')
        tl.to(
          title,
          {
            textShadow: '0 0 48px var(--red), 0 0 96px var(--red-glow), 0 0 140px rgba(232,41,28,0.35)',
            duration: 0.85,
            repeat: 3,
            yoyo: true,
            ease: 'sine.inOut',
          },
          '-=0.75'
        )
        tl.to(sub, { opacity: 1, duration: 0.85, ease: 'power2.out' }, '-=1.2')
      },
      { threshold: 0.4 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section id="future" className={styles.future} ref={sectionRef}>
      <StarField count={500} />
      <div className={styles.marsHorizon} />
      <div className={styles.sunRise} />

      <div ref={finaleRef} className={styles.finaleOverlay} aria-hidden="true">
        <p data-finale-title className={styles.finaleTitle}>
          HUMANITY&apos;S SECOND HOME
        </p>
        <p data-finale-sub className={styles.finaleSub}>
          The journey that began with one rocket ends with a civilization.
        </p>
      </div>

      <div className={styles.container}>
        <div className={`${styles.hero} ${visible ? styles.visible : ''}`}>
          <span className="red-line" />
          <span className={styles.overline}>EPILOGUE · THE STORY CONTINUES</span>
          <h2 className={styles.heading}>
            THE NEXT SKY<br />
            <span>WON’T BE BLUE</span>
          </h2>
          <p className={styles.sub}>
            This isn’t an ending — it’s the first line of a much longer book.
            One print in Jezero becomes streets, schools, arguments, love, loss, and someday children who’ve never seen an ocean — and don’t need to, to know they belong.
          </p>
        </div>

        {/* Timeline */}
        <div className={`${styles.timeline} ${visible ? styles.visible : ''}`}>
          {milestones.map((m, i) => (
            <div
              key={i}
              ref={i === milestones.length - 1 ? lastMileRef : undefined}
              className={`${styles.mile} ${m.done ? styles.mileDone : ''}`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className={styles.mileYear}>{m.year}</div>
              <div className={styles.mileDot}>
                {m.done && <div className={styles.mileDotFill} />}
              </div>
              <div className={styles.mileLabel}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className={`${styles.cta} ${visible ? styles.visible : ''}`}>
          <div className={styles.ctaText}>
            <div className={styles.ctaHeading}>YOUR NAME ON THE MANIFEST</div>
            <div className={styles.ctaSub}>Artemis-M2 · applications 2029</div>
          </div>
          <a href="#hero" className={styles.ctaBtn}>
            <span>BACK TO THE OPENING</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.footerLogo}>
            <span className={styles.footerMark}>◈</span>
            MARS 2027
          </div>
          <div className={styles.footerLinks}>
            <a href="#hero">Opening</a>
            <a href="#mission">Commitment</a>
            <a href="#launch">Ignition</a>
            <a href="#transit">Void</a>
            <a href="#landing">Descent</a>
            <a href="#explore">Surface</a>
            <a href="#future">Horizon</a>
          </div>
          <div className={styles.footerCopy}>
            © 2027 ARTEMIS MARS MISSION. ALL RIGHTS RESERVED.
          </div>
        </div>
      </div>
    </section>
  )
}
