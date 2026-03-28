import React, { useState, useEffect } from 'react'
import styles from './Nav.module.css'

const navLinks = [
  { label: 'Commitment', href: '#mission' },
  { label: 'Ignition', href: '#launch' },
  { label: 'The Void', href: '#transit' },
  { label: 'Descent', href: '#landing' },
  { label: 'Surface', href: '#explore' },
  { label: 'Horizon', href: '#future' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <a href="#hero" className={styles.logo}>
        <span className={styles.logoMark}>◈</span>
        <span>MARS <strong>2027</strong></span>
      </a>

      <ul className={`${styles.links} ${menuOpen ? styles.open : ''}`}>
        {navLinks.map((l) => (
          <li key={l.label}>
            <a href={l.href} onClick={() => setMenuOpen(false)}>
              {l.label}
            </a>
          </li>
        ))}
        <li>
          <a href="#mission" className={styles.cta} onClick={() => setMenuOpen(false)}>
            ENLIST
          </a>
        </li>
      </ul>

      <button
        className={`${styles.burger} ${menuOpen ? styles.burgerOpen : ''}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <span /><span /><span />
      </button>
    </nav>
  )
}
