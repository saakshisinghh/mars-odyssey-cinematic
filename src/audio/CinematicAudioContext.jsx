import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import {
  getMasterMuted,
  initCinematicSound,
  setMasterMuted,
  subscribeMuted,
} from './cinematicSoundManager.js'

const CinematicAudioContext = createContext({
  muted: false,
  toggleMuted: () => {},
})

export function CinematicAudioProvider({ children }) {
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    initCinematicSound()
    setMuted(getMasterMuted())
    return subscribeMuted(setMuted)
  }, [])

  const toggleMuted = useCallback(() => {
    setMasterMuted(!getMasterMuted())
  }, [])

  return (
    <CinematicAudioContext.Provider value={{ muted, toggleMuted }}>
      {children}
    </CinematicAudioContext.Provider>
  )
}

export function useCinematicAudio() {
  return useContext(CinematicAudioContext)
}
