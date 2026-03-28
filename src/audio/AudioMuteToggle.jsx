import React from 'react'
import { useCinematicAudio } from './CinematicAudioContext.jsx'
import styles from './AudioMuteToggle.module.css'

export default function AudioMuteToggle() {
  const { muted, toggleMuted } = useCinematicAudio()

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggleMuted}
      aria-pressed={muted}
      aria-label={muted ? 'Unmute cinematic sound' : 'Mute cinematic sound'}
    >
      <span className={styles.icon} aria-hidden>
        {muted ? '—' : '♪'}
      </span>
      <span className={styles.label}>{muted ? 'Unmute audio' : 'Mute audio'}</span>
    </button>
  )
}
