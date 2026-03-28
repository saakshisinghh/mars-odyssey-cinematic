import React from 'react'
import { CinematicAudioProvider } from './CinematicAudioContext.jsx'
import AudioMuteToggle from './AudioMuteToggle.jsx'

export default function CinematicAudioShell({ children }) {
  return (
    <CinematicAudioProvider>
      {children}
      <AudioMuteToggle />
    </CinematicAudioProvider>
  )
}
