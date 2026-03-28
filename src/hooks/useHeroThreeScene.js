import { useEffect } from 'react'
import * as THREE from 'three'

/* GLSL Shaders */

const FLAME_VERT = /* glsl */`
  uniform float uTime;
  uniform float uIntensity;
  attribute float aSize;
  attribute float aLife;
  attribute vec3 aVelocity;
  varying float vLife;
  varying float vHeat;
  void main() {
    vLife = aLife;
    vHeat = aSize;
    vec3 pos = position + aVelocity * uTime;
    pos.x += sin(uTime * 12.0 + position.y * 4.0) * 0.07 * (1.0 - aLife);
    pos.z += cos(uTime * 10.0 + position.y * 3.5) * 0.06 * (1.0 - aLife);
    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * uIntensity * (170.0 / -mvPos.z) * (1.0 - aLife * 0.5);
    gl_Position = projectionMatrix * mvPos;
  }
`
const FLAME_FRAG = /* glsl */`
  varying float vLife;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;
    float alpha = (1.0 - d * d) * (1.0 - vLife) * 1.3;
    vec3 white  = vec3(1.0, 1.0, 1.0);
    vec3 yellow = vec3(1.0, 0.98, 0.4);
    vec3 orange = vec3(1.0, 0.5, 0.05);
    vec3 red    = vec3(0.95, 0.15, 0.02);
    vec3 col = mix(white, yellow, smoothstep(0.0, 0.2, vLife));
    col = mix(col, orange, smoothstep(0.2, 0.55, vLife));
    col = mix(col, red,    smoothstep(0.55, 1.0, vLife));
    gl_FragColor = vec4(col, alpha);
  }
`
const EXHAUST_VERT = /* glsl */`
  uniform float uTime;
  uniform float uIntensity;
  attribute float aLife;
  attribute vec3 aVelocity;
  attribute float aSize;
  varying float vLife;
  void main() {
    vLife = aLife;
    vec3 pos = position + aVelocity * uTime;
    pos.x += sin(uTime * 4.0 + aLife * 6.28) * aLife * 0.38;
    pos.z += cos(uTime * 3.5 + aLife * 6.28) * aLife * 0.38;
    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * uIntensity * (115.0 / -mvPos.z) * (1.0 - aLife * 0.6);
    gl_Position = projectionMatrix * mvPos;
  }
`
const EXHAUST_FRAG = /* glsl */`
  varying float vLife;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;
    float alpha = (1.0 - d) * (1.0 - vLife) * 0.55;
    vec3 col = mix(vec3(1.0, 0.85, 0.6), vec3(0.35, 0.35, 0.42), vLife);
    gl_FragColor = vec4(col, alpha);
  }
`
const SMOKE_VERT = /* glsl */`
  uniform float uTime;
  attribute float aLife;
  attribute vec3 aVelocity;
  attribute float aSize;
  varying float vLife;
  void main() {
    vLife = aLife;
    vec3 pos = position + aVelocity * uTime;
    pos.x += sin(uTime * 1.5 + aLife * 3.0) * aLife * 0.8;
    pos.z += cos(uTime * 1.2 + aLife * 2.5) * aLife * 0.7;
    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * (220.0 / -mvPos.z) * (0.3 + aLife * 0.7);
    gl_Position = projectionMatrix * mvPos;
  }
`
const SMOKE_FRAG = /* glsl */`
  varying float vLife;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;
    float edge = smoothstep(1.0, 0.0, d);
    float alpha = edge * (1.0 - vLife) * 0.38;
    vec3 col = mix(vec3(0.82, 0.77, 0.68), vec3(0.15, 0.15, 0.18), vLife * 0.65);
    gl_FragColor = vec4(col, alpha);
  }
`
const DUST_VERT = /* glsl */`
  uniform float uTime;
  uniform float uFlow;
  attribute float aSize;
  attribute float aSpeed;
  varying float vAlpha;
  void main() {
    vec3 pos = position;
    pos.z = mod(pos.z + uTime * aSpeed * uFlow, 60.0) - 30.0;
    vAlpha = aSpeed * 0.5 + 0.2;
    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * (85.0 / -mvPos.z);
    gl_Position = projectionMatrix * mvPos;
  }
`
const DUST_FRAG = /* glsl */`
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    if (d > 1.0) discard;
    gl_FragColor = vec4(0.8, 0.75, 0.9, (1.0 - d) * vAlpha * 0.55);
  }
`
const STAR_VERT = /* glsl */`
  uniform float uWarp;
  attribute float aSize;
  attribute float aSpeed;
  varying float vWarp;
  varying float vSize;
  void main() {
    vWarp = uWarp;
    vSize = aSize;
    vec3 pos = position;
    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    float stretch = 1.0 + uWarp * aSpeed * 5.0;
    gl_PointSize = aSize * stretch * (380.0 / -mvPos.z);
    gl_Position = projectionMatrix * mvPos;
  }
`
const STAR_FRAG = /* glsl */`
  uniform float uWarp;
  varying float vWarp;
  varying float vSize;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv * vec2(1.0, 1.0 + uWarp * 9.0)) * 2.0;
    if (d > 1.0) discard;
    float alpha = (1.0 - d) * mix(0.7, 1.0, vWarp);
    vec3 col = mix(vec3(0.9, 0.9, 1.0), vec3(0.4, 0.7, 1.0), uWarp);
    gl_FragColor = vec4(col, alpha);
  }
`

/* Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Scene builders Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */
function buildRocket() {
  const group = new THREE.Group()
  const bodyMat  = new THREE.MeshStandardMaterial({ color: 0xd0d0d0, metalness: 0.7, roughness: 0.3 })
  const darkMat  = new THREE.MeshStandardMaterial({ color: 0x181818, metalness: 0.9, roughness: 0.1 })
  const redMat   = new THREE.MeshStandardMaterial({ color: 0xe8291c, metalness: 0.4, roughness: 0.5, emissive: 0x440800, emissiveIntensity: 0.3 })
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x0a1e3d, metalness: 0.1, roughness: 0.0, transparent: true, opacity: 0.85 })
  const nozzMat  = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.95, roughness: 0.1 })

  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.55, 32), bodyMat); nose.position.y = 0.93; group.add(nose)
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.0, 32), bodyMat); body.position.y = 0.35; group.add(body)
  const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.185, 0.185, 0.06, 32), redMat); stripe.position.y = 0.72; group.add(stripe)
  const port = new THREE.Mesh(new THREE.SphereGeometry(0.065, 16, 16), glassMat); port.position.set(0.18, 0.42, 0); group.add(port)
  const portRing = new THREE.Mesh(new THREE.TorusGeometry(0.068, 0.01, 8, 24), nozzMat); portRing.rotation.y = Math.PI / 2; portRing.position.copy(port.position); group.add(portRing)
  const skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.24, 0.25, 32), bodyMat); skirt.position.y = -0.22; group.add(skirt)
  const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.22, 0.3, 32, 1, true), nozzMat); bell.position.y = -0.5; group.add(bell)
  const bellInner = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.20, 0.29, 32, 1, true), darkMat); bellInner.position.y = -0.5; group.add(bellInner)

  const finShape = new THREE.Shape()
  finShape.moveTo(0, 0); finShape.lineTo(0.22, -0.35); finShape.lineTo(0.22, -0.05); finShape.lineTo(0, 0.15)
  const finGeo = new THREE.ExtrudeGeometry(finShape, { depth: 0.018, bevelEnabled: false })
  finGeo.computeVertexNormals()
  for (let i = 0; i < 4; i++) {
    const fin = new THREE.Mesh(finGeo, bodyMat)
    fin.position.y = -0.28; fin.rotation.y = (i / 4) * Math.PI * 2
    fin.position.x = Math.sin(fin.rotation.y) * 0.22; fin.position.z = Math.cos(fin.rotation.y) * 0.22
    fin.rotation.y += Math.PI / 2; group.add(fin)
  }

  const padGroup = new THREE.Group(); padGroup.name = 'launchPad'
  const padMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8, roughness: 0.4 })
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.04, 0.3), padMat); base.position.y = -0.72; padGroup.add(base)
  for (let s = -1; s <= 1; s += 2) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.28, 0.04), padMat)
    arm.position.set(s * 0.22, -0.58, 0); arm.rotation.z = s * 0.18; padGroup.add(arm)
  }
  group.add(padGroup)
  return group
}

function createFlameSystem(count = 950) {
  const pos = new Float32Array(count * 3), vel = new Float32Array(count * 3), sizes = new Float32Array(count), lives = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2, r = Math.random() * 0.09
    pos[i*3] = Math.cos(angle)*r; pos[i*3+1] = -Math.random()*0.2; pos[i*3+2] = Math.sin(angle)*r
    vel[i*3] = (Math.random()-0.5)*0.04; vel[i*3+1] = -(Math.random()*0.55+0.25); vel[i*3+2] = (Math.random()-0.5)*0.04
    sizes[i] = Math.random()*18+7; lives[i] = Math.random()
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('aVelocity', new THREE.BufferAttribute(vel, 3))
  geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
  geo.setAttribute('aLife', new THREE.BufferAttribute(lives, 1))
  return new THREE.Points(geo, new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uIntensity: { value: 1.0 } },
    vertexShader: FLAME_VERT, fragmentShader: FLAME_FRAG,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  }))
}

function createExhaustSystem(count = 1900) {
  const pos = new Float32Array(count * 3), vel = new Float32Array(count * 3), sizes = new Float32Array(count), lives = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2, r = Math.random() * 0.17
    pos[i*3] = Math.cos(angle)*r; pos[i*3+1] = -Math.random()*0.28; pos[i*3+2] = Math.sin(angle)*r
    const speed = Math.random()*0.85+0.28
    vel[i*3] = (Math.random()-0.5)*0.24; vel[i*3+1] = -speed; vel[i*3+2] = (Math.random()-0.5)*0.24
    sizes[i] = Math.random()*11+4; lives[i] = Math.random()
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('aVelocity', new THREE.BufferAttribute(vel, 3))
  geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
  geo.setAttribute('aLife', new THREE.BufferAttribute(lives, 1))
  return new THREE.Points(geo, new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uIntensity: { value: 1.0 } },
    vertexShader: EXHAUST_VERT, fragmentShader: EXHAUST_FRAG,
    transparent: true, depthWrite: false, blending: THREE.NormalBlending
  }))
}

function createSmokeCloud(count = 900) {
  const pos = new Float32Array(count * 3), vel = new Float32Array(count * 3), sizes = new Float32Array(count), lives = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2, r = Math.random() * 0.35
    pos[i*3] = Math.cos(angle)*r; pos[i*3+1] = -Math.random()*0.35; pos[i*3+2] = Math.sin(angle)*r
    const hSpeed = Math.random()*0.45+0.18
    vel[i*3] = Math.cos(angle)*hSpeed; vel[i*3+1] = Math.random()*0.1-0.05; vel[i*3+2] = Math.sin(angle)*hSpeed
    sizes[i] = Math.random()*45+22; lives[i] = Math.random()*0.4
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('aVelocity', new THREE.BufferAttribute(vel, 3))
  geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
  geo.setAttribute('aLife', new THREE.BufferAttribute(lives, 1))
  return new THREE.Points(geo, new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: SMOKE_VERT, fragmentShader: SMOKE_FRAG,
    transparent: true, depthWrite: false, blending: THREE.NormalBlending
  }))
}

function createSpaceDust(count = 1600) {
  const pos = new Float32Array(count * 3), sizes = new Float32Array(count), speeds = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    pos[i*3] = (Math.random()-0.5)*22; pos[i*3+1] = (Math.random()-0.5)*22; pos[i*3+2] = (Math.random()-0.5)*32
    sizes[i] = Math.random()*2.2+0.5; speeds[i] = Math.random()*0.5+0.2
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
  geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1))
  return new THREE.Points(geo, new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uFlow: { value: 0.4 } },
    vertexShader: DUST_VERT, fragmentShader: DUST_FRAG,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  }))
}

function createWarpStarfield(count = 6500) {
  const pos = new Float32Array(count * 3), speeds = new Float32Array(count), sizes = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    pos[i*3] = (Math.random()-0.5)*200; pos[i*3+1] = (Math.random()-0.5)*200; pos[i*3+2] = (Math.random()-0.5)*200
    speeds[i] = Math.random(); sizes[i] = Math.random()*3.2+0.5
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1))
  geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
  return new THREE.Points(geo, new THREE.ShaderMaterial({
    uniforms: { uWarp: { value: 0 } },
    vertexShader: STAR_VERT, fragmentShader: STAR_FRAG,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  }))
}

function createLights(scene) {
  const engineLight = new THREE.PointLight(0xff6600, 0, 7)
  engineLight.position.set(0, -1.2, 0); scene.add(engineLight)
  scene.add(new THREE.AmbientLight(0x0a0a20, 1.2))
  const sun = new THREE.DirectionalLight(0xffeedd, 1.8); sun.position.set(5, 8, 3); scene.add(sun)
  const rim = new THREE.DirectionalLight(0x2244aa, 0.6); rim.position.set(-4, 2, -3); scene.add(rim)
  return engineLight
}

function createMarsPlanet() {
  const geo = new THREE.SphereGeometry(0.8, 48, 48)
  const mat = new THREE.MeshStandardMaterial({ color: 0x8b3a0c, roughness: 0.85, metalness: 0, emissive: 0x1a0800, emissiveIntensity: 0.15 })
  const mesh = new THREE.Mesh(geo, mat)
  const pa = geo.getAttribute('position')
  for (let i = 0; i < pa.count; i++) {
    const v = new THREE.Vector3(pa.getX(i), pa.getY(i), pa.getZ(i))
    const n = v.clone().normalize()
    v.addScaledVector(n, (Math.sin(n.x*12+0.3)*Math.cos(n.y*8)+Math.sin(n.z*10))*0.018)
    pa.setXYZ(i, v.x, v.y, v.z)
  }
  geo.computeVertexNormals()
  return mesh
}

export function useHeroThreeScene(mountRef, isMobile, heroRocketRef, stateRef) {
  useEffect(() => {
    if (isMobile) return
    const el = mountRef.current; if (!el) return

    const pr = stateRef.phaseRef
    const sync = stateRef.setPhaseSync
    if (!pr || !sync) return

    const W = el.clientWidth, H = el.clientHeight
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(W, H)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.4
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x000005, 0.013)

    const camera = new THREE.PerspectiveCamera(55, W / H, 0.01, 500)
    camera.position.set(0, 0.4, 3.8)

    const rocket = buildRocket(); scene.add(rocket)
    if (heroRocketRef) heroRocketRef.current = rocket
    const engineLight = createLights(scene)

    const flame      = createFlameSystem()
    const exhaust    = createExhaustSystem()
    const smokeCloud = createSmokeCloud()
    const spaceDust  = createSpaceDust()
    const warpStars  = createWarpStarfield()

    flame.position.y = exhaust.position.y = -0.65
    smokeCloud.position.y = -0.72
    flame.visible = exhaust.visible = smokeCloud.visible = false

    scene.add(flame); scene.add(exhaust); scene.add(smokeCloud); scene.add(spaceDust); scene.add(warpStars)

    // Background stars
    const bgGeo = new THREE.BufferGeometry()
    const bgPos = new Float32Array(2800 * 3)
    for (let i = 0; i < 2800; i++) {
      bgPos[i*3] = (Math.random()-0.5)*90; bgPos[i*3+1] = (Math.random()-0.5)*90; bgPos[i*3+2] = (Math.random()-0.5)*90
    }
    bgGeo.setAttribute('position', new THREE.BufferAttribute(bgPos, 3))
    scene.add(new THREE.Points(bgGeo, new THREE.PointsMaterial({ color:0xffffff, size:0.065, transparent:true, opacity:0.92, sizeAttenuation:true })))

    // Planets
    const marsPlanet = createMarsPlanet(); marsPlanet.position.set(3.5, 2.2, -12); scene.add(marsPlanet)
    const marsGlow = new THREE.Mesh(new THREE.SphereGeometry(1.05,24,24), new THREE.MeshBasicMaterial({color:0xc1440e,transparent:true,opacity:0.13,side:THREE.BackSide}))
    marsGlow.position.copy(marsPlanet.position); scene.add(marsGlow)
    const earth = new THREE.Mesh(new THREE.SphereGeometry(1.2,32,32), new THREE.MeshStandardMaterial({color:0x1a3a8c,roughness:0.5,emissive:0x040e2a,emissiveIntensity:0.4}))
    earth.position.set(-4,-2.5,-14); scene.add(earth)

    // Mouse parallax Ã¢â‚¬â€ stored separately, never touches camera during launch
    let mouseX = 0, mouseY = 0, inertX = 0, inertY = 0
    const onMouseMove = e => { mouseX = (e.clientX/window.innerWidth-0.5)*2; mouseY = (e.clientY/window.innerHeight-0.5)*2 }
    window.addEventListener('mousemove', onMouseMove)

    // Particle reset helpers
    const PLIFE = 0.9, SLIFE = 2.4
    function resetParticle(idx, geo, spread) {
      const p = geo.getAttribute('position'), v = geo.getAttribute('aVelocity'), l = geo.getAttribute('aLife')
      const angle = Math.random()*Math.PI*2, r = Math.random()*(spread?0.17:0.09)
      p.setXYZ(idx, Math.cos(angle)*r, 0, Math.sin(angle)*r)
      v.setXYZ(idx, (Math.random()-0.5)*(spread?0.24:0.05), -(Math.random()*(spread?0.85:0.56)+0.24), (Math.random()-0.5)*(spread?0.24:0.05))
      l.setX(idx, 0)
    }
    function resetSmoke(idx) {
      const p = smokeCloud.geometry.getAttribute('position'), v = smokeCloud.geometry.getAttribute('aVelocity'), l = smokeCloud.geometry.getAttribute('aLife')
      const angle = Math.random()*Math.PI*2, r = Math.random()*0.35
      p.setXYZ(idx, Math.cos(angle)*r, -Math.random()*0.2, Math.sin(angle)*r)
      const hs = Math.random()*0.45+0.2
      v.setXYZ(idx, Math.cos(angle)*hs, Math.random()*0.08-0.04, Math.sin(angle)*hs)
      l.setX(idx, 0)
    }

    // Ã¢â€â‚¬Ã¢â€â‚¬ Smooth lerp helper Ã¢â€â‚¬Ã¢â€â‚¬
    const lerp = (a, b, t) => a + (b - a) * t
    // Smooth damp: eases toward target with inertia Ã¢â‚¬â€ feels organic, not mechanical
    const smoothDamp = (cur, target, vel, smoothTime, dt) => {
      const omega = 2 / smoothTime
      const x = omega * dt
      const exp = 1 / (1 + x + 0.48*x*x + 0.235*x*x*x)
      const change = cur - target
      const temp = (vel.v + omega * change) * dt
      vel.v = (vel.v - omega * temp) * exp
      return target + (change + temp) * exp
    }

    // Ã¢â€â‚¬Ã¢â€â‚¬ All animation state lives here Ã¢â‚¬â€ tick loop is the single owner Ã¢â€â‚¬Ã¢â€â‚¬
    stateRef.current = { rocket, camera, renderer, flame, exhaust, warpStars, smokeCloud, spaceDust, engineLight, launchTime: null }

    let flameT = 0, exhaustT = 0, smokeT = 0

    // Ã¢â€â‚¬Ã¢â€â‚¬ Camera state Ã¢â‚¬â€ smooth damp velocities for organic motion Ã¢â€â‚¬Ã¢â€â‚¬
    let camX = 0, camY = 0.4, camZ = 3.8
    let camTargetX = 0, camTargetY = 0.4, camTargetZ = 3.8
    let camLookTarget = 0.2, camLookCur = 0.2
    const camVelX = {v:0}, camVelY = {v:0}, camVelZ = {v:0}, camVelLook = {v:0}

    // Shake: additive offset that decays to 0 on its own
    let shakeAmt = 0
    // Warp
    let warpStart = null
    // Exhaust intensity target for smooth ramp
    let exhaustIntensityTarget = 1.0

    const clock = new THREE.Clock()
    let rafId

    const tick = () => {
      rafId = requestAnimationFrame(tick)
      const dt = Math.min(clock.getDelta(), 0.05)
      const now = clock.getElapsedTime()
      const cur = pr.current

      // Ã¢â€â‚¬Ã¢â€â‚¬ 1. ROCKET ANIMATION Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
      if (cur === 'idle' || cur === 'counting') {
        rocket.position.y = Math.sin(now * 0.9) * 0.046
        rocket.rotation.z = Math.sin(now * 0.55) * 0.013
        rocket.rotation.x = Math.sin(now * 0.35) * 0.007
        rocket.scale.setScalar(1)

      } else if (cur === 'ignite') {
        if (!stateRef.current.launchTime) stateRef.current.launchTime = now
        const igniteAge = now - stateRef.current.launchTime

        // Rocket strains against clamps Ã¢â‚¬â€ micro-vibration that builds intensity
        const buildUp = Math.min(igniteAge / 1.8, 1)
        const vib = Math.sin(igniteAge * 28) * 0.006 * buildUp
                  + Math.sin(igniteAge * 43) * 0.003 * buildUp
        rocket.position.y = vib
        // Subtle Y-axis compression Ã¢â‚¬â€ it squats slightly as thrust builds
        rocket.scale.y = 1 - Math.sin(igniteAge * 9) * 0.012 * buildUp
        rocket.scale.x = rocket.scale.z = 1 + Math.sin(igniteAge * 9) * 0.006 * buildUp
        rocket.rotation.z = Math.sin(igniteAge * 19) * 0.004 * buildUp

        // Engine light intensifies dramatically Ã¢â‚¬â€ deep red to orange to yellow
        const flicker = (Math.sin(now*80)*0.5+0.5) * (Math.sin(now*53)*0.3+0.7)
        engineLight.intensity = flicker * 18 * buildUp
        engineLight.color.setHSL(0.05 + buildUp * 0.05, 1.0, 0.55)
        exhaustIntensityTarget = lerp(exhaustIntensityTarget, 2.5, dt * 5)

        // After 2s ignite hold Ã¢â€ â€™ launch (longer buildup = more drama)
        if (igniteAge > 2.0) {
          stateRef.current.launchTime = null
          sync('launch')
        }

      } else if (cur === 'launch') {
        if (!stateRef.current.launchTime) stateRef.current.launchTime = now
        const age = now - stateRef.current.launchTime

        // Ã¢â€â‚¬Ã¢â€â‚¬ Cinematic 7-second launch arc Ã¢â€â‚¬Ã¢â€â‚¬
        // Act 1 (0Ã¢â‚¬â€œ1.2s): rocket breaks free Ã¢â‚¬â€ slow, labored, fighting gravity
        // Act 2 (1.2Ã¢â‚¬â€œ4s): exponential acceleration, rocket tilts into gravity turn
        // Act 3 (4Ã¢â‚¬â€œ7s): supersonic surge, becomes a star
        const t = Math.min(age / 7.0, 1.0)

        let rocketY
        if (t < 0.17) {
          // Act 1: barely lifts, strains, then suddenly breaks free
          const t1 = t / 0.17
          rocketY = Math.pow(t1, 3) * 0.18  // cubic ease-in, creeps up ~0.18 units
        } else {
          // Act 2+3: exponential surge Ã¢â‚¬â€ matches how real rockets shed mass
          const t2 = (t - 0.17) / 0.83
          rocketY = 0.18 + Math.pow(t2, 2.6) * 28
        }
        rocket.position.y = rocketY

        // Gravity turn Ã¢â‚¬â€ rocket gradually tilts right (pitch-over maneuver)
        // Starts at 1.5s in, peaks at ~5Ã‚Â° like Saturn V
        const turnT = Math.max(0, Math.min((age - 1.5) / 4.0, 1))
        const gravityTurn = Math.sin(turnT * Math.PI * 0.5) * 0.088  // ~5 degrees
        rocket.rotation.z = -gravityTurn
        // Slight x-axis attitude change adds realism
        rocket.rotation.x = Math.sin(age * 0.3) * 0.008 * Math.min(age, 1)

        // Scale Ã¢â‚¬â€ real perspective shrink as it climbs (NOT a cheat, camera follows too)
        const scaleFade = Math.max(1 - Math.pow(t, 1.4) * 0.97, 0.01)
        rocket.scale.setScalar(scaleFade)

        // Engine light Ã¢â‚¬â€ roaring full power, orange-white
        const flicker = 1 + Math.sin(now*52)*0.12 + Math.sin(now*79)*0.07 + Math.sin(now*113)*0.04
        engineLight.intensity = lerp(engineLight.intensity, 14 * flicker, dt * 6)
        engineLight.color.setHSL(0.08, 1.0, 0.65)  // warm orange-white
        engineLight.position.y = rocketY - 1.2

        // Shake: violent at clamp release, fades through max-Q, gone in thin air
        const shakeEnvelope = t < 0.05 ? t / 0.05          // ramp up at release
          : t < 0.35 ? 1.0 - (t - 0.05) / 0.5             // decay through atmosphere
          : 0
        shakeAmt = 0.028 * shakeEnvelope

        // Exhaust
        exhaustIntensityTarget = lerp(exhaustIntensityTarget, 4.0, dt * 2)

        // Ã¢â€â‚¬Ã¢â€â‚¬ Cinematic camera choreography Ã¢â€â‚¬Ã¢â€â‚¬
        // Shot 1 (0Ã¢â‚¬â€œ1.5s): tight on the rocket base, camera pushes in slightly
        // Shot 2 (1.5Ã¢â‚¬â€œ4s): camera crane-up tracking the ascent, pulls back to show scale
        // Shot 3 (4Ã¢â‚¬â€œ7s): wide shot, camera tilts up as rocket becomes a bright dot
        if (age < 1.5) {
          // Close-up Ã¢â‚¬â€ locked just below exhaust, slight push in
          const s = age / 1.5
          camTargetZ = lerp(3.8, 3.2, s * s)   // push toward rocket
          camTargetY = lerp(0.1, -0.3, s)        // drift down to frame the base + flame
          camTargetX = 0
          camLookTarget = lerp(0.2, rocketY * 0.6, s)
        } else if (age < 4.0) {
          // Crane shot Ã¢â‚¬â€ pull back dramatically while tracking upward
          const s = (age - 1.5) / 2.5
          camTargetZ = lerp(3.2, 6.5, Math.pow(s, 0.7))  // dramatic pullback
          camTargetY = rocketY * 0.28 - 0.2              // crane up with rocket
          camTargetX = 0.0
          camLookTarget = rocketY * 0.6
        } else {
          // Wide/hero shot Ã¢â‚¬â€ rocket is tiny, frame it against the stars
          const s = Math.min((age - 4.0) / 3.0, 1)
          camTargetZ = lerp(6.5, 8.5, s)
          camTargetY = rocketY * 0.18 + 0.5
          camLookTarget = rocketY * 0.45
        }

        // Warp gate Ã¢â‚¬â€ rocket almost gone
        if (t > 0.88 && !stateRef.current.warpTriggered) {
          stateRef.current.warpTriggered = true
          sync('warp')
          setTimeout(() => document.getElementById('mission')?.scrollIntoView({ behavior:'smooth' }), 2200)
          setTimeout(() => sync('orbit'), 5000)
        }
      }

      // Ã¢â€â‚¬Ã¢â€â‚¬ 2. CAMERA Ã¢â‚¬â€ smooth damp for organic cinematic feel Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
      if (cur === 'idle' || cur === 'counting') {
        inertX += (mouseX * 0.28 - inertX) * 0.046
        inertY += (mouseY * 0.14 - inertY) * 0.046
        camTargetX = inertX
        camTargetY = 0.4 + inertY * 0.5
        camTargetZ = 3.8
        camLookTarget = 0.2
      }

      // Shake: random offset, natural decay
      const shakeX = shakeAmt > 0.0005 ? (Math.random()-0.5) * shakeAmt : 0
      const shakeY = shakeAmt > 0.0005 ? (Math.random()-0.5) * shakeAmt * 0.4 : 0
      shakeAmt *= 0.86

      // Smooth damp Ã¢â‚¬â€ feels like a physical camera with inertia, not a lerp robot
      const smoothT = (cur === 'idle' || cur === 'counting') ? 0.18 : 0.55
      const smoothTZ = (cur === 'idle' || cur === 'counting') ? 0.22 : 0.9
      camX = smoothDamp(camX, camTargetX, camVelX, smoothT, dt)
      camY = smoothDamp(camY, camTargetY, camVelY, smoothT, dt)
      camZ = smoothDamp(camZ, camTargetZ, camVelZ, smoothTZ, dt)
      camLookCur = smoothDamp(camLookCur, camLookTarget, camVelLook, 0.45, dt)

      camera.position.set(camX + shakeX, camY + shakeY, camZ)
      camera.lookAt(0, camLookCur, 0)

      // Ã¢â€â‚¬Ã¢â€â‚¬ 3. PLANETS Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
      marsPlanet.rotation.y += dt * 0.065
      earth.rotation.y += dt * 0.032
      marsPlanet.position.x = 3.5 + Math.sin(now*0.042)*0.45
      marsPlanet.position.y = 2.2 + Math.cos(now*0.031)*0.22
      marsGlow.position.copy(marsPlanet.position)

      // Ã¢â€â‚¬Ã¢â€â‚¬ 4. SPACE DUST Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
      spaceDust.material.uniforms.uTime.value = now
      spaceDust.material.uniforms.uFlow.value = cur === 'warp' ? 4.5 : 0.45

      // Ã¢â€â‚¬Ã¢â€â‚¬ 5. WARP STARS Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
      const starPos = warpStars.geometry.getAttribute('position')
      const warpVal = warpStars.material.uniforms.uWarp.value
      const zSpeed = cur === 'warp' ? (18 + warpVal * 110) : 1.2
      for (let i = 0; i < starPos.count; i++) {
        let z = starPos.getZ(i) + dt * zSpeed
        if (z > 100) z -= 200
        starPos.setZ(i, z)
      }
      starPos.needsUpdate = true

      if (cur === 'warp') {
        if (!warpStart) warpStart = now
        const wt = Math.min((now - warpStart) / 2.5, 1)
        warpStars.material.uniforms.uWarp.value = lerp(warpVal, wt * 0.96, 0.05)
        // Camera gently drifts forward during warp Ã¢â‚¬â€ tick owns z the whole time
        camTargetZ = Math.min(camTargetZ + dt * 1.4, 14.0)
      } else {
        warpStars.material.uniforms.uWarp.value *= 0.94
        if (cur !== 'orbit') warpStart = null
      }

      // Ã¢â€â‚¬Ã¢â€â‚¬ 6. PARTICLES Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
      const particlesActive = cur === 'ignite' || cur === 'launch' || cur === 'warp'
      if (particlesActive) {
        flame.visible = exhaust.visible = true
        flameT = (flameT + dt) % PLIFE
        exhaustT = (exhaustT + dt) % PLIFE

        const flicker = 1.0 + Math.sin(now*38)*0.3 + Math.sin(now*55)*0.18
        flame.material.uniforms.uTime.value = flameT
        flame.material.uniforms.uIntensity.value = flicker

        // Smooth exhaust intensity
        exhaust.material.uniforms.uIntensity.value = lerp(
          exhaust.material.uniforms.uIntensity.value,
          exhaustIntensityTarget,
          dt * 3
        )
        exhaust.material.uniforms.uTime.value = exhaustT

        // Age particles
        const fl = flame.geometry.getAttribute('aLife')
        for (let i = 0; i < fl.count; i++) { let l = fl.getX(i) + dt/PLIFE*2.0; if(l>1){l=0;resetParticle(i,flame.geometry,false)} fl.setX(i,l) }
        fl.needsUpdate = true
        const el2 = exhaust.geometry.getAttribute('aLife')
        for (let i = 0; i < el2.count; i++) { let l = el2.getX(i) + dt/PLIFE*1.15; if(l>1){l=0;resetParticle(i,exhaust.geometry,true)} el2.setX(i,l) }
        el2.needsUpdate = true

        // Particles follow rocket
        flame.position.y = exhaust.position.y = rocket.position.y - 0.65
        smokeCloud.position.y = rocket.position.y - 0.72

        // Smoke
        smokeCloud.visible = true
        smokeT = (smokeT + dt) % SLIFE
        smokeCloud.material.uniforms.uTime.value = smokeT
        const sl = smokeCloud.geometry.getAttribute('aLife')
        for (let i = 0; i < sl.count; i++) { let l = sl.getX(i) + dt/SLIFE*0.75; if(l>1){l=0;resetSmoke(i)} sl.setX(i,l) }
        sl.needsUpdate = true
      } else {
        flame.visible = exhaust.visible = false
        if (cur !== 'orbit') smokeCloud.visible = false
        if (cur === 'idle' || cur === 'counting') {
          engineLight.intensity = 0
          exhaustIntensityTarget = 1.0
          shakeAmt = 0
        }
      }

      renderer.render(scene, camera)
    }
    tick()

    const onResize = () => {
      const w = el.clientWidth, h = el.clientHeight
      renderer.setSize(w,h); camera.aspect = w/h; camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (heroRocketRef) heroRocketRef.current = null
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [isMobile])

}

