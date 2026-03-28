import React, { useEffect, useState, useRef } from 'react'
import styles from './Mission.module.css'
import gsap from 'gsap'

const missionData = [
  { num: '01', label: 'THE WHY', title: 'This is where we leave the only world we’ve known.', body: 'Mars isn’t escape — it’s insurance. Ice under the dust. A day almost like ours. A place far enough to force us to grow up. The question isn’t if we’re capable. It’s whether we’re willing to go.' },
  { num: '02', label: 'THE WHO', title: 'Six names. One hull.', body: 'Vasquez. Patel. Osei. Tanaka. Ferretti. Dubois. Seven years of drills, failures, and small mercies. They won’t fix Mars alone — but they’ll be the first to stand there when Earth is only a pale point in the sky.' },
  { num: '03', label: 'THE MACHINE', title: 'Artemis-M1', body: 'Steel, methane, and stubborn math. Fairing wide enough for a future. Engines that can lift off twice — here, and someday, from red dust. Not a monument. A door.' },
]

export default function Mission() {
  const [activeTab, setActiveTab] = useState(0)
  const sectionRef = useRef(null)
  const bgRef      = useRef(null)
  const headingRef = useRef(null)
  const statsRef   = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setVisible(true)
        // GSAP stagger on heading lines
        if (headingRef.current) {
          const lines = headingRef.current.querySelectorAll('[data-line]')
          gsap.fromTo(lines,
            { y: 50, opacity: 0, skewY: 3 },
            { y: 0, opacity: 1, skewY: 0, stagger: 0.12, duration: 0.9, ease: 'power3.out', delay: 0.2 }
          )
        }
        // GSAP stagger on stats
        if (statsRef.current) {
          const stats = statsRef.current.querySelectorAll('[data-stat]')
          gsap.fromTo(stats,
            { y: 30, opacity: 0, scale: 0.9 },
            { y: 0, opacity: 1, scale: 1, stagger: 0.1, duration: 0.7, ease: 'back.out(1.4)', delay: 0.4 }
          )
        }
      }
    }, { threshold: 0.15 })
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const el = sectionRef.current
      if (!el || !bgRef.current) return
      const rect = el.getBoundingClientRect()
      const progress = -rect.top / window.innerHeight
      bgRef.current.style.transform = `translateY(${progress * 40}px)`
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section id="mission" className={styles.mission} ref={sectionRef}>
      <div ref={bgRef} className={styles.bgGlow}/>
      <div className={styles.bgLine1}/>
      <div className={styles.bgLine2}/>
      <div className={styles.sectionNum}>02</div>

      <div className={styles.container}>
        <div className={`${styles.left} ${visible ? styles.visible : ''}`}>
          <span className="red-line"/>
          <span className={styles.overline}>THE COMMITMENT · BEFORE THE STACK</span>
          <h2 className={styles.heading} ref={headingRef}>
            <span data-line style={{display:'block'}}>YOU DON’T PACK</span>
            <span data-line style={{display:'block'}}>FOR A VACATION</span>
          </h2>
          <p className={styles.intro} data-line>
            First crewed landing. Seven months in the dark. A foothold on another world.
            Everything ahead is borrowed time — until someone steps onto red ground and makes it real.
          </p>

          <div className={styles.tabs}>
            {missionData.map((item, i) => (
              <button
                key={i}
                className={`${styles.tab} ${activeTab === i ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(i)}
              >
                <span className={styles.tabNum}>{item.num}</span>
                <span className={styles.tabLabel}>{item.label}</span>
              </button>
            ))}
          </div>

          <div className={styles.tabContent}>
            <h3 className={styles.tabTitle}>{missionData[activeTab].title}</h3>
            <p className={styles.tabBody}>{missionData[activeTab].body}</p>
          </div>
        </div>

        <div className={`${styles.right} ${visible ? styles.visible : ''}`}>
          <div className={styles.statsGrid} ref={statsRef}>
            {[
              { val: '225M', unit: 'KM',     desc: 'Average gap between worlds' },
              { val: '7',    unit: 'MONTHS', desc: 'Outbound through the void' },
              { val: '18',   unit: 'MONTHS', desc: 'Surface — if nothing goes wrong' },
              { val: '6',    unit: 'CREW',   desc: 'Everyone the mission can afford' },
            ].map((s, i) => (
              <div className={styles.stat} key={i} data-stat style={{ animationDelay: `${i*0.1}s` }}>
                <div className={styles.statVal}>
                  <span className={styles.statNum}>{s.val}</span>
                  <span className={styles.statUnit}>{s.unit}</span>
                </div>
                <p className={styles.statDesc}>{s.desc}</p>
              </div>
            ))}
          </div>

          <div className={styles.badge}>
            <svg viewBox="0 0 120 120" className={styles.badgeSvg}>
              <circle cx="60" cy="60" r="55" fill="none" stroke="rgba(232,41,28,0.3)" strokeWidth="1"/>
              <circle cx="60" cy="60" r="45" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
              <path d="M60 10 A50 50 0 0 1 110 60" fill="none" stroke="var(--red)" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="60" cy="60" r="30" fill="rgba(232,41,28,0.05)" stroke="rgba(232,41,28,0.2)" strokeWidth="1"/>
              <text x="60" y="53" textAnchor="middle" fill="white" fontSize="9" fontFamily="Bebas Neue" letterSpacing="2">ARTEMIS</text>
              <text x="60" y="65" textAnchor="middle" fill="var(--red)" fontSize="14" fontFamily="Bebas Neue" letterSpacing="3">M-1</text>
              <text x="60" y="77" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="7" fontFamily="Barlow Condensed" letterSpacing="1">MARS 2027</text>
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}
