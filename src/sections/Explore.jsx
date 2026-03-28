import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import styles from './Explore.module.css'

const discoveries = [
  {
    id: '01',
    title: "The River's Ghost",
    status: 'CONFIRMED',
    desc: 'Billions of years ago, water ran here. Layered stone remembers. Organic traces at a dozen sites — not proof of life, but a whisper.',
    icon: '🌊',
    color: '#4a9eff',
    lat: 18.4, lon: 77.7,
  },
  {
    id: '02',
    title: 'Ice Under the Dust',
    status: 'CONFIRMED',
    desc: 'Radar finds a frozen sheet meters down — enough water to buy decades: drink it, crack it for air, pretend the desert isn’t empty.',
    icon: '❄',
    color: '#80d4ff',
    lat: 22.1, lon: 82.3,
  },
  {
    id: '03',
    title: 'Breath in the Season',
    status: 'UNDER ANALYSIS',
    desc: 'Methane spikes when the sun hits. Life? Chemistry? Both answers change us. The planet isn’t finished speaking.',
    icon: '⚗',
    color: '#ffaa00',
    lat: 15.8, lon: 74.2,
  },
  {
    id: '04',
    title: "A Shape That Shouldn't Exist",
    status: 'UNCONFIRMED',
    desc: 'Sample ART-07: tiny tubes that look like something once lived. Could be nothing. Could be everything. The lab will decide what we’re allowed to hope.',
    icon: '🔬',
    color: '#e8291c',
    lat: 19.0, lon: 79.5,
  },
]

const roverStats = [
  { label: 'DISTANCE COVERED', val: '142 km' },
  { label: 'SAMPLES COLLECTED', val: '47' },
  { label: 'SURFACE DAYS', val: '312' },
  { label: 'OXYGEN PRODUCED', val: '28 kg' },
]

function latLonToVec3(lat, lon, radius) {
  const phi   = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
     radius * Math.cos(phi),
     radius * Math.sin(phi) * Math.sin(theta)
  )
}

function latLonToDiscSvg(lat, lon, cx, cy, R) {
  const phi = ((90 - lat) * Math.PI) / 180
  const theta = (lon * Math.PI) / 180
  return {
    x: cx + R * Math.sin(phi) * Math.sin(theta),
    y: cy - R * Math.cos(phi),
  }
}

export default function Explore() {
  const sectionRef  = useRef(null)
  const globeRef    = useRef(null)
  const [visible, setVisible]       = useState(false)
  const [activeDisc, setActiveDisc] = useState(0)
  const [isMobile, setIsMobile]     = useState(false)
  const stateRef = useRef({})
  const activeDiscRef = useRef(0)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768 || /Mobi|Android/i.test(navigator.userAgent))
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    activeDiscRef.current = activeDisc
  }, [activeDisc])

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  /* ── Three.js Mars Globe ── */
  useEffect(() => {
    if (isMobile) return
    const el = globeRef.current
    if (!el) return

    const W = el.clientWidth, H = el.clientHeight
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(W, H)
    el.appendChild(renderer.domElement)

    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100)
    camera.position.set(0, 0, 3.5)

    /* Lighting */
    const ambient = new THREE.AmbientLight(0x0a0808, 2.0)
    scene.add(ambient)
    const sun = new THREE.DirectionalLight(0xffeedd, 2.5)
    sun.position.set(5, 3, 5)
    scene.add(sun)
    const rimLight = new THREE.DirectionalLight(0x441100, 0.8)
    rimLight.position.set(-5, -2, -3)
    scene.add(rimLight)

    /* Mars sphere with procedural surface */
    const marsGeo = new THREE.SphereGeometry(1, 64, 64)
    const marsMat = new THREE.MeshStandardMaterial({
      color: 0x9b4a18,
      roughness: 0.9,
      metalness: 0.0,
      emissive: 0x1a0800,
      emissiveIntensity: 0.1,
    })

    /* Add surface variation */
    const posAttr = marsGeo.getAttribute('position')
    for (let i = 0; i < posAttr.count; i++) {
      const v = new THREE.Vector3(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i))
      const n = v.clone().normalize()
      const bump =
        Math.sin(n.x * 8 + 1.2) * Math.cos(n.y * 6) * 0.02 +
        Math.sin(n.z * 12 + 0.5) * Math.cos(n.x * 9) * 0.015 +
        Math.sin(n.y * 15 + 2.1) * 0.01
      v.addScaledVector(n, bump)
      posAttr.setXYZ(i, v.x, v.y, v.z)
    }
    marsGeo.computeVertexNormals()

    const marsMesh = new THREE.Mesh(marsGeo, marsMat)
    scene.add(marsMesh)

    /* Atmosphere glow */
    const atmGeo = new THREE.SphereGeometry(1.08, 32, 32)
    const atmMat = new THREE.MeshBasicMaterial({
      color: 0xc1440e,
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide
    })
    scene.add(new THREE.Mesh(atmGeo, atmMat))

    /* Pole ice caps */
    const capMat = new THREE.MeshStandardMaterial({ color: 0xeeeeff, roughness: 0.3, metalness: 0.0 })
    const northCap = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 8, 0, Math.PI * 2, 0, 0.35), capMat)
    northCap.position.y = 0.97
    scene.add(northCap)
    const southCap = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 8, 0, Math.PI * 2, Math.PI - 0.25, 0.25), capMat)
    southCap.position.y = -0.97
    scene.add(southCap)

    /* Valles Marineris canyon strip */
    const canyonGeo = new THREE.TorusGeometry(1.001, 0.012, 4, 80, Math.PI * 0.55)
    const canyonMat = new THREE.MeshStandardMaterial({ color: 0x5a2008, roughness: 1.0 })
    const canyon = new THREE.Mesh(canyonGeo, canyonMat)
    canyon.rotation.x = Math.PI / 2
    canyon.rotation.z = 0.3
    canyon.position.set(0.1, -0.05, 0)
    scene.add(canyon)

    /* Discovery markers */
    const markerGeo = new THREE.SphereGeometry(0.025, 8, 8)
    const markers = discoveries.map((d) => {
      const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(d.color) })
      const mesh = new THREE.Mesh(markerGeo, mat)
      const pos = latLonToVec3(d.lat, d.lon, 1.04)
      mesh.position.copy(pos)
      scene.add(mesh)

      /* Ping ring */
      const ringGeo = new THREE.RingGeometry(0.03, 0.045, 16)
      const ringMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(d.color), transparent: true, opacity: 0.6, side: THREE.DoubleSide })
      const ring = new THREE.Mesh(ringGeo, ringMat)
      ring.position.copy(pos)
      ring.lookAt(new THREE.Vector3(0, 0, 0))
      ring.rotateX(Math.PI / 2)
      scene.add(ring)

      return { mesh, ring, mat, ringMat }
    })

    stateRef.current = { marsMesh, markers, renderer, scene, camera }

    /* Mouse drag rotation */
    let isDragging = false, lastX = 0, lastY = 0
    let rotX = 0.15, rotY = 0
    let velX = 0, velY = 0.003

    const onDown = (e) => {
      isDragging = true
      lastX = e.clientX || e.touches?.[0]?.clientX
      lastY = e.clientY || e.touches?.[0]?.clientY
      velX = 0; velY = 0
    }
    const onMove = (e) => {
      if (!isDragging) return
      const cx = e.clientX || e.touches?.[0]?.clientX
      const cy = e.clientY || e.touches?.[0]?.clientY
      velY = (cx - lastX) * 0.005
      velX = (cy - lastY) * 0.005
      lastX = cx; lastY = cy
    }
    const onUp = () => { isDragging = false }

    el.addEventListener('mousedown', onDown)
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseup', onUp)
    el.addEventListener('mouseleave', onUp)
    el.addEventListener('touchstart', onDown, { passive: true })
    el.addEventListener('touchmove', onMove, { passive: true })
    el.addEventListener('touchend', onUp)

    let rafId
    const clock = new THREE.Clock()
    const tick = () => {
      rafId = requestAnimationFrame(tick)
      const t = clock.getElapsedTime()

      if (!isDragging) {
        velY += (0.003 - velY) * 0.02
        velX += (0 - velX) * 0.05
      }
      rotY += velY
      rotX += velX
      rotX = Math.max(-0.5, Math.min(0.5, rotX))

      marsMesh.rotation.y = rotY
      marsMesh.rotation.x = rotX
      northCap.rotation.y = rotY
      northCap.rotation.x = rotX
      southCap.rotation.y = rotY
      southCap.rotation.x = rotX
      canyon.rotation.y = rotY

      /* Animate markers */
      markers.forEach((m, i) => {
        const d = discoveries[i]
        const pos = latLonToVec3(d.lat, d.lon, 1.04)
        const rotMat = new THREE.Matrix4().makeRotationY(rotY).multiply(new THREE.Matrix4().makeRotationX(rotX))
        pos.applyMatrix4(rotMat)
        m.mesh.position.copy(pos)
        m.ring.position.copy(pos)
        m.ring.lookAt(camera.position)

        const pulse = 0.6 + Math.sin(t * 2 + i) * 0.4
        const ad = activeDiscRef.current
        m.ringMat.opacity = ad === i ? pulse * 0.8 : 0.3
        m.mat.opacity = ad === i ? 1 : 0.6
        const scale = ad === i ? 1.5 + Math.sin(t * 3) * 0.2 : 1
        m.mesh.scale.setScalar(scale)
        m.ring.scale.setScalar(ad === i ? 1 + Math.sin(t * 2) * 0.3 : 1)
      })

      renderer.render(scene, camera)
    }
    tick()

    const onResize = () => {
      const w = el.clientWidth, h = el.clientHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
      el.removeEventListener('mousedown', onDown)
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseup', onUp)
      el.removeEventListener('mouseleave', onUp)
      el.removeEventListener('touchstart', onDown)
      el.removeEventListener('touchmove', onMove)
      el.removeEventListener('touchend', onUp)
      renderer.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [isMobile])

  return (
    <section id="explore" className={styles.explore} ref={sectionRef}>
      <div className={styles.marsBg} />
      <div className={styles.scanLine} />

      <div className={styles.container}>
        {/* Header */}
        <div className={`${styles.header} ${visible ? styles.visible : ''}`}>
          <span className="red-line" />
          <span className={styles.overline}>FIRST LIGHT ON ANOTHER WORLD</span>
          <h2 className={styles.heading}>THE DUST<br /><span>SPEAKS BACK</span></h2>
          <p className={styles.sub}>
            Every sol, the ground tells a story — if you listen through metal and glass.
            Rovers and boots share the same question: were we ever alone?
          </p>
        </div>

        {/* Main grid: discoveries + 3D globe */}
        <div className={styles.grid}>
          {/* Discovery list */}
          <div className={styles.discList}>
            {discoveries.map((d, i) => (
              <div
                key={i}
                role="button"
                tabIndex={0}
                className={`${styles.discItem} ${activeDisc === i ? styles.discActive : ''} ${visible ? styles.discVisible : ''}`}
                style={{ transitionDelay: `${0.1 + i * 0.1}s` }}
                onClick={() => setActiveDisc(i)}
                onKeyDown={(e) => {
                  if (e.key !== 'Enter' && e.key !== ' ') return
                  e.preventDefault()
                  setActiveDisc(i)
                }}
              >
                <span className={styles.discId}>{d.id}</span>
                <div className={styles.discInfo}>
                  <div className={styles.discTitle}>{d.title}</div>
                  <div
                    className={styles.discStatus}
                    style={{ color: d.color }}
                  >
                    <span className={styles.statusIndicator} style={{ background: d.color }} />
                    {d.status}
                  </div>
                </div>
                <span className={styles.discIcon}>{d.icon}</span>
              </div>
            ))}
          </div>

          {/* 3D Mars Globe */}
          <div className={`${styles.globeWrap} ${visible ? styles.visible : ''}`}>
            <div className={styles.globeLabel}>
              <span className={styles.globeIndicator} />
              {isMobile ? 'TAP SITES — JEZERO (STATIC MAP)' : 'DRAG TO ROTATE — JEZERO CRATER REGION'}
            </div>
            {isMobile ? (
              <div className={`${styles.globe} ${styles.marsDiscHost}`}>
                <svg className={styles.marsDiscSvg} viewBox="0 0 400 400" role="img" aria-label="Mars map with four discovery sites">
                  <defs>
                    <radialGradient id="exploreMarsDisc" cx="38%" cy="35%" r="65%">
                      <stop offset="0%" stopColor="#c45a28" />
                      <stop offset="55%" stopColor="#8b3a12" />
                      <stop offset="100%" stopColor="#3d1508" />
                    </radialGradient>
                  </defs>
                  <circle cx="200" cy="202" r="152" fill="url(#exploreMarsDisc)" stroke="rgba(193,68,14,0.45)" strokeWidth="2" />
                  <ellipse cx="168" cy="118" rx="28" ry="14" fill="rgba(255,255,255,0.12)" transform="rotate(-12 168 118)" />
                  {discoveries.map((d, i) => {
                    const { x, y } = latLonToDiscSvg(d.lat, d.lon, 200, 205, 138)
                    const r = activeDisc === i ? 11 : 7
                    return (
                      <g key={d.id}>
                        <circle
                          cx={x}
                          cy={y}
                          r={r + 6}
                          fill="transparent"
                          style={{ cursor: 'pointer' }}
                          onClick={() => setActiveDisc(i)}
                          onKeyDown={(e) => {
                            if (e.key !== 'Enter' && e.key !== ' ') return
                            e.preventDefault()
                            setActiveDisc(i)
                          }}
                          tabIndex={0}
                          role="button"
                          aria-label={`${d.title}, site ${d.id}`}
                        />
                        <circle
                          cx={x}
                          cy={y}
                          r={r}
                          fill={d.color}
                          stroke="rgba(255,255,255,0.5)"
                          strokeWidth={activeDisc === i ? 2 : 1}
                          style={{ pointerEvents: 'none' }}
                        />
                        <text
                          x={x}
                          y={y - r - 10}
                          textAnchor="middle"
                          fill="rgba(255,255,255,0.9)"
                          fontSize="11"
                          style={{ fontFamily: 'var(--font-condensed), sans-serif', pointerEvents: 'none' }}
                        >
                          {d.id} · {d.title}
                        </text>
                      </g>
                    )
                  })}
                </svg>
              </div>
            ) : (
              <div ref={globeRef} className={styles.globe} />
            )}
            <div className={styles.globeOverlay}>
              <div className={styles.activeDiscInfo}>
                <span className={styles.activeDiscIcon}>{discoveries[activeDisc].icon}</span>
                <div>
                  <div className={styles.activeDiscTitle}>{discoveries[activeDisc].title}</div>
                  <div className={styles.activeDiscDesc}>{discoveries[activeDisc].desc}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rover stats bar */}
        <div className={`${styles.roverStats} ${visible ? styles.visible : ''}`}>
          <div className={styles.roverLabel}>ROVER — ARTEMIS-R1</div>
          {roverStats.map((s, i) => (
            <div className={styles.roverStat} key={i}>
              <span className={styles.roverVal}>{s.val}</span>
              <span className={styles.roverKey}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
