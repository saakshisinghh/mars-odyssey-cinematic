import { useEffect, useRef } from 'react'

export function useParallax(speed = 0.3) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const handleScroll = () => {
      const rect = el.getBoundingClientRect()
      const scrolled = window.scrollY
      const elementTop = rect.top + scrolled
      const relativeScroll = scrolled - elementTop
      el.style.transform = `translateY(${relativeScroll * speed}px)`
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed])

  return ref
}

export function useCountUp(target, duration = 2000, start = false) {
  const ref = useRef(null)

  useEffect(() => {
    if (!start || !ref.current) return
    let startTime = null
    const startVal = 0

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.floor(eased * (target - startVal) + startVal)
      if (ref.current) ref.current.textContent = current.toLocaleString()
      if (progress < 1) requestAnimationFrame(step)
    }

    requestAnimationFrame(step)
  }, [start, target, duration])

  return ref
}
