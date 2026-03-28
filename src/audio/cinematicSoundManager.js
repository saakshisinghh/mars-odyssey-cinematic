import gsap from 'gsap'
import { CINEMATIC_AUDIO, STORAGE_KEY } from './assets.js'

const levels = {
  rocket: 0,
  ambient: 0,
  landing: 0,
}

let master = 1
let rocketEl = null
let ambientEl = null
let landingEl = null
let ambientShouldPlay = false
let listeners = new Set()
/** One-shot emotional beat: void opens, sound nearly drops out, then returns. */
let transitDeepSilencePlayed = false

function notify() {
  listeners.forEach((fn) => {
    try {
      fn(master < 0.5)
    } catch (_) {}
  })
}

function applyCinematicLevels() {
  const m = master
  if (rocketEl) rocketEl.volume = Math.min(1, Math.max(0, levels.rocket * m))
  if (ambientEl) ambientEl.volume = Math.min(1, Math.max(0, levels.ambient * m))
  if (landingEl) landingEl.volume = Math.min(1, Math.max(0, levels.landing * m))
}

function killLevelTweens() {
  gsap.killTweensOf(levels)
}

function ensureAudio() {
  if (rocketEl) return

  const mk = (src, loop) => {
    const a = new Audio(src)
    a.preload = 'auto'
    a.loop = loop
    return a
  }

  rocketEl = mk(CINEMATIC_AUDIO.rocket, false)
  ambientEl = mk(CINEMATIC_AUDIO.ambient, true)
  landingEl = mk(CINEMATIC_AUDIO.landing, false)
}

export function initCinematicSound() {
  ensureAudio()
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === '1') master = 0
  } catch (_) {}
  applyCinematicLevels()
  notify()
}

export function subscribeMuted(cb) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export function getMasterMuted() {
  return master < 0.5
}

export function setMasterMuted(muted) {
  master = muted ? 0 : 1
  try {
    localStorage.setItem(STORAGE_KEY, muted ? '1' : '0')
  } catch (_) {}
  killLevelTweens()
  applyCinematicLevels()
  if (!muted) {
    if (ambientShouldPlay && ambientEl && levels.ambient > 0.01) {
      ambientEl.play().catch(() => {})
    }
  } else {
    if (rocketEl) rocketEl.pause()
    if (ambientEl) ambientEl.pause()
    if (landingEl) landingEl.pause()
  }
  notify()
}

/**
 * Volumes are driven on the same GSAP timeline as the rocket (Launch.jsx).
 */
export function attachLaunchTimelineAudio(tl) {
  ensureAudio()

  tl.call(
    () => {
      levels.rocket = 0
      levels.ambient = 0
      rocketEl.currentTime = 0
      rocketEl.play().catch(() => {})
    },
    null,
    0.9,
  )

  tl.to(
    levels,
    { rocket: 0.35, duration: 0.85, ease: 'power2.in', onUpdate: applyCinematicLevels },
    0.9,
  )

  tl.to(
    levels,
    { rocket: 1, duration: 0.2, ease: 'power4.out', onUpdate: applyCinematicLevels },
    1.8,
  )

  tl.call(
    () => {
      ambientShouldPlay = true
      ambientEl.currentTime = 0
      ambientEl.play().catch(() => {})
    },
    null,
    3.6,
  )

  tl.to(
    levels,
    { rocket: 0.55, ambient: 0.42, duration: 1.35, ease: 'power2.inOut', onUpdate: applyCinematicLevels },
    3.6,
  )

  tl.to(
    levels,
    { rocket: 0.1, ambient: 0.78, duration: 1.45, ease: 'power1.inOut', onUpdate: applyCinematicLevels },
    4.85,
  )

  tl.to(
    levels,
    { rocket: 0, ambient: 0.88, duration: 1.15, ease: 'power2.out', onUpdate: applyCinematicLevels },
    5.95,
  )
}

export function onTransitSectionVisible() {
  ensureAudio()
  ambientShouldPlay = true
  transitDeepSilencePlayed = false
  killLevelTweens()
  gsap.to(levels, {
    ambient: Math.max(levels.ambient, 0.92),
    duration: 2.2,
    ease: 'power2.inOut',
    onStart: () => {
      ambientEl.play().catch(() => {})
    },
    onUpdate: applyCinematicLevels,
  })
}

/** Call from Transit scroll (~mid-journey). Sudden hush → lonely drift → swell. */
export function tryTransitDeepSilenceMoment(scrollProgress) {
  if (transitDeepSilencePlayed || scrollProgress < 0.4) return
  transitDeepSilencePlayed = true
  ensureAudio()
  ambientShouldPlay = true
  killLevelTweens()
  if (ambientEl && ambientEl.paused) ambientEl.play().catch(() => {})
  gsap.timeline({ onUpdate: applyCinematicLevels })
    .to(levels, { ambient: 0.05, duration: 0.55, ease: 'power3.in' })
    .to(levels, { ambient: 0.94, duration: 3.2, ease: 'sine.inOut' }, '+=0.45')
}

export function onLandingApproach() {
  ensureAudio()
  killLevelTweens()
  gsap.to(levels, {
    ambient: 0.38,
    duration: 1.6,
    ease: 'power2.inOut',
    onUpdate: applyCinematicLevels,
  })
}

export function onLandingTouchdown() {
  ensureAudio()
  killLevelTweens()
  gsap.to(levels, {
    ambient: 0.2,
    landing: 1,
    duration: 0.35,
    ease: 'power2.out',
    onStart: () => {
      landingEl.currentTime = 0
      landingEl.play().catch(() => {})
    },
    onUpdate: applyCinematicLevels,
  })

  gsap.to(levels, {
    landing: 0,
    duration: 2.6,
    ease: 'power2.inOut',
    delay: 1.1,
    onUpdate: applyCinematicLevels,
  })

  gsap.to(levels, {
    ambient: 0.52,
    duration: 3.2,
    ease: 'sine.inOut',
    delay: 1.4,
    onUpdate: applyCinematicLevels,
  })
}
