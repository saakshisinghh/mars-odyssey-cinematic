import React, { useEffect, useState } from 'react'
import styles from './ProgressBar.module.css'

export default function ProgressBar() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      setProgress((window.scrollY / totalHeight) * 100)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className={styles.bar}>
      <div className={styles.fill} style={{ width: `${progress}%` }} />
    </div>
  )
}
