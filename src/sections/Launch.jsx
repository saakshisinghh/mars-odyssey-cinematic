import React, { useEffect, useState, useRef, useCallback } from 'react'
import gsap from 'gsap'
import { attachLaunchTimelineAudio } from '../audio/cinematicSoundManager.js'
import styles from './Launch.module.css'

const timelineItems = [
  { time: 'T-72 HRS', event: 'Last quiet night', detail: 'Go/no-go. The stack doesn’t care about speeches — only green lights.' },
  { time: 'T-6 HRS', event: 'Doors close', detail: 'Suits. Harnesses. The planet outside gets smaller before you’ve left it.' },
  { time: 'T-45 MIN', event: 'Ship wakes up', detail: 'Internal power. Pad empty. The machine owns the countdown now.' },
  { time: 'T-10 MIN', event: 'Ignition primed', detail: 'Computers in charge. Cold fuel. Hot breath waiting under the deck.' },
  { time: 'T-00:00', event: 'WE LEAVE', detail: 'Thirty-three hearts of fire. Earth lets go — or you do.' },
  { time: 'T+2 MIN', event: 'Through the wall', detail: 'Max-Q. The air tries to crush you. The rocket says no.' },
  { time: 'T+8 MIN', event: 'First silence', detail: 'MECO. Stage gone. A new orbit — and the long fall upward begins.' },
]

/* ─── Particle System ────────────────────────────────────────────────── */
class Particle {
  constructor() {
    this.active = false
    this.isSmoke = true
    this.x = 0; this.y = 0
    this.vx = 0; this.vy = 0
    this.life = 0; this.maxLife = 1
    this.size = 1; this.opacity = 0
  }

  spawnSmoke(x, y, intensity) {
    this.active = true; this.isSmoke = true
    this.x = x + (Math.random() - 0.5) * 16
    this.y = y + Math.random() * 6
    this.vx = (Math.random() - 0.5) * (1.5 + intensity * 1.4)
    this.vy = Math.random() * 1.6 + 0.5 + intensity * 0.8
    this.life = 0
    this.maxLife = Math.random() * 80 + 55
    this.size = Math.random() * 20 + 9 + intensity * 12
    this.opacity = Math.random() * 0.42 + 0.22
  }

  spawnFire(x, y, intensity) {
    this.active = true; this.isSmoke = false
    this.x = x + (Math.random() - 0.5) * 10
    this.y = y + Math.random() * 4
    this.vx = (Math.random() - 0.5) * 2.2
    this.vy = Math.random() * 3.8 + 1.8
    this.life = 0
    this.maxLife = Math.random() * 22 + 12
    this.size = Math.random() * 10 + 4
    this.opacity = Math.random() * 0.55 + 0.5
  }
}

const POOL = Array.from({ length: 500 }, () => new Particle())
let poolCursor = 0
function acquireParticle() {
  // Find a free slot or recycle oldest
  const start = poolCursor
  do {
    const p = POOL[poolCursor % POOL.length]
    poolCursor++
    if (!p.active) return p
  } while (poolCursor % POOL.length !== start % POOL.length)
  // All busy — force recycle
  const p = POOL[poolCursor % POOL.length]
  poolCursor++
  return p
}

/* ─── Rocket Canvas Component ────────────────────────────────────────── */
function RocketCanvas({ phase }) {
  const canvasRef = useRef(null)
  const stateRef = useRef({
    rocketY: 0,
    rocketStartY: 0,
    // vibration before launch
    vibrateAmp: 0,
    // camera shake
    shakeX: 0,
    shakeY: 0,
    // glow state
    glowIntensity: 0,
    // smoke / fire emission rates (0–1)
    smokeRate: 0,
    fireRate: 0,
    // runtime
    launched: false,
    tick: 0,
    rafId: null,
    activeParticles: [],
    tl: null,
  })

  /* ── Draw helper: rocket body ──────────────────────────────────── */
  const drawRocket = useCallback((ctx, cx, ry, glow, flicker, shakeX, shakeY) => {
    ctx.save()
    ctx.translate(cx + shakeX, ry + shakeY)

    /* Engine glow */
    if (glow > 0.01) {
      const fi = glow * (0.88 + flicker * 0.12)

      // Diffuse halo
      const halo = ctx.createRadialGradient(0, 56, 0, 0, 62, 58 * fi + 4)
      halo.addColorStop(0,   `rgba(255,190,40,${0.55 * fi})`)
      halo.addColorStop(0.35,`rgba(255,90,10,${0.30 * fi})`)
      halo.addColorStop(0.7, `rgba(255,30,0,${0.10 * fi})`)
      halo.addColorStop(1,   'rgba(0,0,0,0)')
      ctx.beginPath()
      ctx.ellipse(0, 60, 58 * fi + 4, 58 * fi + 4, 0, 0, Math.PI * 2)
      ctx.fillStyle = halo; ctx.fill()

      // Bright core
      const core = ctx.createRadialGradient(0, 50, 0, 0, 52, 20 * fi)
      const ca = Math.min(1, fi * 1.25)
      core.addColorStop(0,   `rgba(255,255,230,${ca})`)
      core.addColorStop(0.3, `rgba(255,230,80,${ca * 0.85})`)
      core.addColorStop(0.7, `rgba(255,110,10,${ca * 0.45})`)
      core.addColorStop(1,   'rgba(0,0,0,0)')
      ctx.beginPath()
      ctx.ellipse(0, 52, 20 * fi, 24 * fi, 0, 0, Math.PI * 2)
      ctx.fillStyle = core; ctx.fill()
    }

    /* Nozzle bell */
    ctx.beginPath()
    ctx.moveTo(-11, 50); ctx.lineTo(-17, 63); ctx.lineTo(17, 63); ctx.lineTo(11, 50)
    ctx.closePath()
    const ng = ctx.createLinearGradient(-17, 0, 17, 0)
    ng.addColorStop(0, '#4a4a4a'); ng.addColorStop(0.5, '#9a9a9a'); ng.addColorStop(1, '#4a4a4a')
    ctx.fillStyle = ng; ctx.fill()
    ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 0.5; ctx.stroke()

    /* Engine skirt */
    ctx.beginPath()
    ctx.moveTo(-12, 36); ctx.lineTo(-15, 50); ctx.lineTo(15, 50); ctx.lineTo(12, 36)
    ctx.closePath()
    const sg = ctx.createLinearGradient(-15, 0, 15, 0)
    sg.addColorStop(0, '#888'); sg.addColorStop(0.5, '#d0d0d0'); sg.addColorStop(1, '#888')
    ctx.fillStyle = sg; ctx.fill()

    /* Main fuselage */
    const bg = ctx.createLinearGradient(-13, 0, 13, 0)
    bg.addColorStop(0, '#787878')
    bg.addColorStop(0.3, '#d2d2d2')
    bg.addColorStop(0.6, '#e8e8e8')
    bg.addColorStop(1, '#787878')
    ctx.beginPath()
    ctx.roundRect(-13, -52, 26, 90, 2)
    ctx.fillStyle = bg; ctx.fill()
    ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 0.5; ctx.stroke()

    /* Red band */
    ctx.fillStyle = '#e8291c'
    ctx.fillRect(-13, -24, 26, 8)

    /* Porthole */
    ctx.beginPath(); ctx.arc(0, -36, 6.5, 0, Math.PI * 2)
    ctx.fillStyle = '#0a1628'; ctx.fill()
    ctx.strokeStyle = '#bbb'; ctx.lineWidth = 1.5; ctx.stroke()
    ctx.beginPath(); ctx.arc(-2, -38, 2.2, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.fill()

    /* Nose cone */
    const ncg = ctx.createLinearGradient(-14, 0, 14, 0)
    ncg.addColorStop(0, '#767676'); ncg.addColorStop(0.4, '#d5d5d5'); ncg.addColorStop(1, '#888')
    ctx.beginPath()
    ctx.moveTo(0, -104)
    ctx.quadraticCurveTo(14, -74, 13, -52)
    ctx.lineTo(-13, -52)
    ctx.quadraticCurveTo(-14, -74, 0, -104)
    ctx.closePath()
    ctx.fillStyle = ncg; ctx.fill()
    ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 0.5; ctx.stroke()

    /* Fins */
    for (const s of [-1, 1]) {
      ctx.save()
      ctx.scale(s, 1)
      ctx.beginPath()
      ctx.moveTo(13, 36); ctx.lineTo(30, 60); ctx.lineTo(30, 44); ctx.lineTo(13, 26)
      ctx.closePath()
      const fg = ctx.createLinearGradient(13, 0, 30, 0)
      fg.addColorStop(0, '#b2b2b2'); fg.addColorStop(1, '#686868')
      ctx.fillStyle = fg; ctx.fill()
      ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 0.5; ctx.stroke()
      ctx.restore()
    }

    ctx.restore()
  }, [])

  /* ── Draw helper: launch pad ───────────────────────────────────── */
  const drawPad = useCallback((ctx, cx, py) => {
    ctx.save()
    ctx.translate(cx, py)

    // Support legs
    for (const s of [-1, 1]) {
      ctx.save(); ctx.scale(s, 1)
      ctx.fillStyle = '#2e2e2e'
      ctx.beginPath()
      ctx.moveTo(14, 0); ctx.lineTo(38, -38); ctx.lineTo(34, -38); ctx.lineTo(11, 0)
      ctx.closePath(); ctx.fill()
      ctx.restore()
    }

    // Base platform
    ctx.fillStyle = '#282828'
    ctx.fillRect(-65, 0, 130, 18)
    ctx.fillStyle = '#1e1e1e'
    ctx.fillRect(-65, 18, 130, 6)

    // Flame trench
    const tg = ctx.createLinearGradient(0, 0, 0, 45)
    tg.addColorStop(0, '#181818'); tg.addColorStop(1, '#080808')
    ctx.fillStyle = tg
    ctx.fillRect(-42, 0, 84, 45)

    ctx.restore()
  }, [])

  /* ── Main effect: setup canvas + render loop + GSAP timeline ───── */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const st = stateRef.current

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      st.rocketStartY = canvas.height * 0.70
      if (!st.launched) st.rocketY = st.rocketStartY
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    /* GSAP timeline:
       Phase 1 (0–0.9s)  → glow + smoke build
       Phase 2 (0.9–1.8s) → full ignition, fire starts, vibration
       Phase 3 (1.8–2.2s) → shake peak at ignition moment
       Phase 4 (2.2–6.0s) → rocket lift (slow → fast)
       Phase 5 (2.8–5.5s) → smoke/shake taper
    */
    const tl = gsap.timeline({ paused: true })

    // Glow + smoke warmup
    tl.to(st, { glowIntensity: 0.28, smokeRate: 0.25, duration: 0.9, ease: 'power2.in' }, 0)
    // Ignition ramp
    tl.to(st, { glowIntensity: 0.80, smokeRate: 0.90, fireRate: 0.65, duration: 0.9, ease: 'power3.inOut' }, 0.9)
    // Full power burst
    tl.to(st, { glowIntensity: 1.0, smokeRate: 1.0, fireRate: 1.0, duration: 0.25, ease: 'power4.out' }, 1.8)
    // Pre-vibration
    tl.to(st, { vibrateAmp: 1.8, duration: 0.35, ease: 'power2.in' }, 1.4)
    // Shake peak
    tl.to(st, { shakeX: 3.2, shakeY: 2.0, duration: 0.08, ease: 'none', yoyo: true, repeat: 18 }, 1.75)
    // Rocket lifts — physics: slow start (gravity overcome) → accelerating
    tl.to(st, {
      rocketY: -canvas.height * 0.65,
      duration: 4.0,
      ease: 'power3.in',
      onStart: () => { st.launched = true },
    }, 2.1)
    // Vibration stops as rocket lifts
    tl.to(st, { vibrateAmp: 0, duration: 0.5, ease: 'power2.out' }, 2.1)
    // Shake decays
    tl.to(st, { shakeX: 0, shakeY: 0, duration: 1.2, ease: 'power2.out' }, 2.4)
    // Smoke / fire taper as rocket climbs
    tl.to(st, { smokeRate: 0.55, fireRate: 0.75, duration: 1.8, ease: 'power1.out' }, 2.8)
    tl.to(st, { smokeRate: 0.25, fireRate: 0.45, glowIntensity: 0.80, duration: 1.6, ease: 'power2.out' }, 4.2)

    st.tl = tl
    attachLaunchTimelineAudio(tl)

    /* Render loop */
    let lastTs = 0
    const frame = (ts) => {
      const dt = Math.min(ts - lastTs, 50)
      lastTs = ts
      st.tick++

      const W = canvas.width, H = canvas.height
      ctx.clearRect(0, 0, W, H)

      const cx = W / 2
      const ry = st.rocketY
      const padY = st.rocketStartY + 100

      // Nozzle exit world pos (particles spawn here)
      const engineX = cx
      const engineY = ry + 62

      /* ── Spawn smoke ─────────────────────────────────────────── */
      if (st.smokeRate > 0) {
        const n = Math.floor(st.smokeRate * 4.5 + Math.random() * 3)
        for (let i = 0; i < n; i++) {
          const p = acquireParticle()
          p.spawnSmoke(engineX, engineY, st.smokeRate)
          if (!st.activeParticles.includes(p)) st.activeParticles.push(p)
        }
      }

      /* ── Spawn fire ──────────────────────────────────────────── */
      if (st.fireRate > 0) {
        const n = Math.floor(st.fireRate * 7 + Math.random() * 5)
        for (let i = 0; i < n; i++) {
          const p = acquireParticle()
          p.spawnFire(engineX, engineY, st.fireRate)
          if (!st.activeParticles.includes(p)) st.activeParticles.push(p)
        }
      }

      /* ── Update + draw particles ─────────────────────────────── */
      const dtScale = dt / 16
      for (let i = st.activeParticles.length - 1; i >= 0; i--) {
        const p = st.activeParticles[i]
        if (!p.active) { st.activeParticles.splice(i, 1); continue }

        p.life += 1
        if (p.life >= p.maxLife) {
          p.active = false; st.activeParticles.splice(i, 1); continue
        }

        const t = p.life / p.maxLife

        p.x += p.vx * dtScale
        p.y += p.vy * dtScale
        p.vx *= 0.986
        p.vy *= 0.991
        p.vx += (Math.random() - 0.5) * 0.09

        if (p.isSmoke) {
          // Smooth fade in → plateau → fade out
          const fadeIn  = Math.min(1, t * 6)
          const fadeOut = Math.max(0, 1 - t * 1.05)
          const alpha   = p.opacity * fadeIn * fadeOut
          const radius  = p.size * (1 + t * 2.8)

          // Warm near engine, cool grey as it rises
          const warmth = Math.max(0, 1 - t * 2.8)
          const r = 130 + Math.round(warmth * 90)
          const g = 125 + Math.round(warmth * 70)
          const b = 118 + Math.round(warmth * 40)

          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius)
          grad.addColorStop(0,   `rgba(${r},${g},${b},${alpha})`)
          grad.addColorStop(0.5, `rgba(${r},${g},${b},${alpha * 0.5})`)
          grad.addColorStop(1,   `rgba(${r},${g},${b},0)`)
          ctx.beginPath()
          ctx.arc(p.x, p.y, radius, 0, Math.PI * 2)
          ctx.fillStyle = grad; ctx.fill()
        } else {
          // Fire: hot core → orange → dissipate
          const fadeOut = Math.pow(Math.max(0, 1 - t), 0.9)
          const alpha   = p.opacity * fadeOut
          const radius  = p.size * (1 - t * 0.55)
          if (radius < 0.5) continue

          const gv = Math.round(200 * (1 - t) + 50 * t)
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius)
          grad.addColorStop(0,   `rgba(255,255,210,${alpha * 1.1})`)
          grad.addColorStop(0.28,`rgba(255,${gv},10,${alpha})`)
          grad.addColorStop(0.65,`rgba(210,35,5,${alpha * 0.45})`)
          grad.addColorStop(1,   'rgba(0,0,0,0)')
          ctx.beginPath()
          ctx.arc(p.x, p.y, radius, 0, Math.PI * 2)
          ctx.fillStyle = grad; ctx.fill()
        }
      }

      /* ── Launch pad (hide once rocket is well above) ─────────── */
      if (ry < padY + 80) {
        drawPad(ctx, cx, padY)
      }

      /* ── Flicker offset ──────────────────────────────────────── */
      const flicker = Math.sin(st.tick * 0.38) * 0.5 + Math.sin(st.tick * 0.71) * 0.3 + Math.sin(st.tick * 1.2) * 0.2

      /* ── Vibration before launch ─────────────────────────────── */
      const vib = st.vibrateAmp > 0
        ? (Math.random() - 0.5) * st.vibrateAmp
        : 0

      /* ── Camera shake ────────────────────────────────────────── */
      const sx = (Math.random() - 0.5) * st.shakeX + vib
      const sy = (Math.random() - 0.5) * st.shakeY + vib * 0.6

      /* ── Draw rocket ─────────────────────────────────────────── */
      drawRocket(ctx, cx, ry, st.glowIntensity, flicker, sx, sy)

      st.rafId = requestAnimationFrame(frame)
    }
    st.rafId = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(st.rafId)
      ro.disconnect()
      if (st.tl) st.tl.kill()
    }
  }, [drawRocket, drawPad])

  /* Trigger GSAP timeline when parent says go */
  useEffect(() => {
    const st = stateRef.current
    if (phase === 'launch' && st.tl) {
      st.tl.restart()
    }
  }, [phase])

  return (
    <canvas
      ref={canvasRef}
      className={styles.rocketCanvas}
      aria-hidden="true"
    />
  )
}

/* ─── Launch Section ─────────────────────────────────────────────────── */
export default function Launch() {
  const [activeStep, setActiveStep] = useState(null)
  const sectionRef = useRef(null)
  const [visible, setVisible] = useState(false)
  const [rocketPhase, setRocketPhase] = useState('idle')

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setVisible(true)
        setRocketPhase('launch')

        // Sync timeline text with animation (slight delay after ignition warmup)
        let step = 0
        const delay = setTimeout(() => {
          const iv = setInterval(() => {
            setActiveStep(step)
            step++
            if (step >= timelineItems.length) clearInterval(iv)
          }, 430)
        }, 650)

        observer.disconnect()
        return () => clearTimeout(delay)
      }
    }, { threshold: 0.2 })

    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="launch" className={styles.launch} ref={sectionRef}>
      <div className={styles.bgVideo}>
        <div className={styles.fireBg} />
      </div>

      {/* Physics rocket canvas — sits above bgVideo, below overlay */}
      <RocketCanvas phase={rocketPhase} />

      <div className={styles.overlay} />

      <div className={styles.container}>
        <div className={`${styles.header} ${visible ? styles.visible : ''}`}>
          <span className="red-line" />
          <span className={styles.overline}>T-0 · THERE IS NO TURNING BACK</span>
          <h2 className={styles.heading}>
            THE SKY<br />
            <span className={styles.headingAccent}>WILL OPEN</span>
          </h2>
          <p className={styles.sub}>
            Florida. Dark before dawn. Billions watch — but only six sit on the flame.
            When the clock hits zero, comfort ends and trajectory begins.
          </p>
        </div>

        <div className={styles.timeline}>
          {timelineItems.map((item, i) => (
            <div
              key={i}
              role="button"
              tabIndex={0}
              className={`${styles.timelineItem} ${activeStep !== null && i <= activeStep ? styles.timelineActive : ''} ${i === 4 ? styles.liftoffItem : ''}`}
              onClick={() => setActiveStep(i)}
              onKeyDown={(e) => {
                if (e.key !== 'Enter' && e.key !== ' ') return
                e.preventDefault()
                setActiveStep(i)
              }}
            >
              <div className={styles.timelineLeft}>
                <div className={styles.timelineTime}>{item.time}</div>
              </div>
              <div className={styles.timelineLine}>
                <div className={styles.timelineDot} />
                {i < timelineItems.length - 1 && <div className={styles.timelineConnector} />}
              </div>
              <div className={styles.timelineRight}>
                <div className={styles.timelineEvent}>{item.event}</div>
                <div className={styles.timelineDetail}>{item.detail}</div>
              </div>
            </div>
          ))}
        </div>

        <div className={`${styles.dataRow} ${visible ? styles.visible : ''}`}>
          {[
            { label: 'THRUST', value: '7,590 kN' },
            { label: 'ENGINES', value: '33 RAPTOR' },
            { label: 'PAYLOAD', value: '150 MT' },
            { label: 'ALTITUDE', value: '400+ KM' },
          ].map((d, i) => (
            <div className={styles.dataItem} key={i}>
              <span className={styles.dataValue}>{d.value}</span>
              <span className={styles.dataLabel}>{d.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
