import * as THREE from 'three';
import { gsap } from 'gsap';

// --- THREE.JS BACKGROUND ---
const canvas = document.querySelector('#bg-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

// Geometry: Floating "Emotional" Sphere
const geometry = new THREE.IcosahedronGeometry(10, 64);
const material = new THREE.MeshPhongMaterial({
    color: 0x1e3a8a,
    wireframe: true,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.5,
});
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

// Particles System
const particlesCount = 8000; // Increased for more density
const posArray = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 100;
}

const particlesGeometry = new THREE.BufferGeometry();
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

const particlesMaterial = new THREE.PointsMaterial({
    size: 0.04,
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// Lighting
const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(20, 20, 20);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(pointLight, ambientLight);

// Interaction state
let mouseX = 0;
let mouseY = 0;
let targetPosX = 0;
let targetPosY = 0;

// Mouse listener
window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - window.innerWidth / 2) / 100;
    mouseY = (e.clientY - window.innerHeight / 2) / 100;
});

// Device Orientation (Gyroscope)
function handleOrientation(event) {
    // Increased intensity: Divided by 10 instead of 20 for double the range
    // beta: tilt front-to-back, gamma: tilt left-to-right
    mouseX = event.gamma / 10;
    mouseY = (event.beta - 45) / 10;
}

// Request permission for iOS 13+
function requestGyroPermission() {
    const prompt = document.getElementById('gyro-prompt');

    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
            .then(response => {
                if (response === 'granted') {
                    window.addEventListener('deviceorientation', handleOrientation);
                    if (prompt) prompt.style.display = 'none';
                } else {
                    alert('Motion permission denied. Please refresh and allow to see effects.');
                    if (prompt) prompt.style.display = 'none';
                }
            })
            .catch(err => {
                console.error(err);
                if (prompt) prompt.style.display = 'none';
            });
    } else {
        // Non-iOS or older devices (usually don't need permission)
        window.addEventListener('deviceorientation', handleOrientation);
        if (prompt) prompt.style.display = 'none';
    }
}

// Global listener for the prompt
window.addEventListener('DOMContentLoaded', () => {
    const prompt = document.getElementById('gyro-prompt');
    if (prompt) {
        prompt.addEventListener('click', requestGyroPermission);
        prompt.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevent double trigger
            requestGyroPermission();
        }, { passive: false });
    }
});

function animate() {
    requestAnimationFrame(animate);

    sphere.rotation.x += 0.003;
    sphere.rotation.y += 0.003;

    // Animate particles
    particlesMesh.rotation.y += 0.001;
    particlesMesh.position.y -= 0.01; // Constant slow drift

    if (particlesMesh.position.y < -30) {
        particlesMesh.position.y = 30;
    }

    // Interactive shift
    const targetX = mouseX * 0.5;
    const targetY = -mouseY * 0.5;

    sphere.position.x += (targetX - sphere.position.x) * 0.05;
    sphere.position.y += (targetY - sphere.position.y) * 0.05 + Math.sin(Date.now() * 0.001) * 0.01;

    particlesMesh.rotation.x += (mouseY * 0.0005 - particlesMesh.rotation.x) * 0.05;
    particlesMesh.rotation.y += (mouseX * 0.0005 - particlesMesh.rotation.y) * 0.05;

    camera.lookAt(scene.position);
    renderer.render(scene, camera);
}
animate();

// Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- CURSOR LOGIC ---
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

window.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;

    gsap.to(cursorDot, { x: posX, y: posY, duration: 0 });
    gsap.to(cursorOutline, { x: posX, y: posY, duration: 0.15 });
});

// --- GSAP REVEAL ANIMATIONS ---
gsap.from('.hero-content h1', {
    y: 100,
    opacity: 0,
    scale: 0.8,
    duration: 2,
    ease: 'expo.out',
    delay: 0.5
});

// Magnetic effect for the domain name itself
const domainName = document.querySelector('.glitch-text');
domainName.addEventListener('mousemove', (e) => {
    const rect = domainName.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.3;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
    gsap.to(domainName, { x, y, duration: 0.4, ease: 'power2.out' });
});

domainName.addEventListener('mouseleave', () => {
    gsap.to(domainName, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' });
});
