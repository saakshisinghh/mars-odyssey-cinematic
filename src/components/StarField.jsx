import React, { useEffect, useRef } from 'react'

export default function StarField({ count = 200, speed = 0, warp = false }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId
    let stars = []

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      stars = Array.from({ length: count }, mkStar)
    }

    function mkStar() {
      const w = canvas.width || 800, h = canvas.height || 600
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random() * w,
        r: Math.random() * 1.6 + 0.2,
        o: Math.random() * 0.6 + 0.4,
        twinkleSpeed:  Math.random() * 0.022 + 0.004,
        twinkleOffset: Math.random() * Math.PI * 2,
        vy: speed,
        color: Math.random() > 0.85 ? `rgba(180,200,255,` : (Math.random() > 0.7 ? `rgba(255,230,200,` : `rgba(255,255,255,`)
      }
    }

    let frame = 0
    const draw = () => {
      animId = requestAnimationFrame(draw)
      frame++
      const w = canvas.width, h = canvas.height

      if (warp) {
        ctx.fillStyle = 'rgba(0,0,5,0.22)'
        ctx.fillRect(0, 0, w, h)
      } else {
        // Always leave a tiny trail for depth
        ctx.fillStyle = 'rgba(0,0,5,0.08)'
        ctx.fillRect(0, 0, w, h)
      }

      const cx = w / 2, cy = h / 2

      stars.forEach((s) => {
        if (warp) {
          s.z -= 7 + speed * 2.2
          if (s.z <= 0) { s.x = Math.random() * w; s.y = Math.random() * h; s.z = w }
          const sx = (s.x - cx) * (w / s.z) + cx
          const sy = (s.y - cy) * (w / s.z) + cy
          const sr = Math.max(0.1, (1 - s.z / w) * 3)
          const alpha = 1 - s.z / w
          const pz = s.z + 7 + speed * 2.2
          const px = (s.x - cx) * (w / pz) + cx
          const py = (s.y - cy) * (w / pz) + cy
          ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(sx, sy)
          ctx.strokeStyle = `rgba(200,220,255,${alpha * 0.95})`
          ctx.lineWidth = sr; ctx.stroke()
        } else {
          // Gentle continuous drift toward viewer
          s.z -= 0.4
          if (s.z <= 0) { s.x = Math.random() * w; s.y = Math.random() * h; s.z = w }
          const sx = (s.x - cx) * (w / s.z) + cx
          const sy = (s.y - cy) * (w / s.z) + cy
          const sr = Math.max(0.1, (1 - s.z / w) * 2.2)
          const alpha = (1 - s.z / w) * (s.o * (Math.sin(frame * s.twinkleSpeed + s.twinkleOffset) * 0.2 + 0.8))

          ctx.beginPath()
          ctx.arc(sx, sy, sr, 0, Math.PI * 2)
          ctx.fillStyle = `${s.color}${alpha})`
          ctx.fill()

          // Twinkle glow for bright stars
          if (sr > 1.4 && alpha > 0.7) {
            ctx.beginPath()
            ctx.arc(sx, sy, sr * 2.5, 0, Math.PI * 2)
            const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr * 2.5)
            g.addColorStop(0, `${s.color}${alpha * 0.3})`)
            g.addColorStop(1, `${s.color}0)`)
            ctx.fillStyle = g; ctx.fill()
          }

          if (speed) { s.y += s.vy; if (s.y > h) { s.y = 0; s.x = Math.random() * w } }
        }
      })
    }

    resize()
    draw()
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [count, speed, warp])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    />
  )
}
