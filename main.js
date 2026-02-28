import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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


// --- MUSIC PLAYER ---
const musicData = [
    {
        title: "grief",
        artist: "Madi Marie",
        cover: "https://oss.ashes.vip/emo/grief.jpg!p50",
        audio: "https://oss.ashes.vip/emo/Madi%20Marie%20-%20grief%20.mp3"
    },
    {
        title: "As the World Caves In (Wuki Remix)",
        artist: "Sarah Cothran、Wuki",
        cover: "https://oss.ashes.vip/emo/Sarah%20Cothran%E3%80%81Wuki%20-%20As%20the%20World%20Caves%20In%20%28Wuki%20Remix%29.jpg!p50",
        audio: "https://oss.ashes.vip/emo/Sarah%20Cothran%E3%80%81Wuki%20-%20As%20the%20World%20Caves%20In%20%28Wuki%20Remix%29.mp3"
    },
    {
        title: "i want",
        artist: "氟西汀海",
        cover: "https://oss.ashes.vip/emo/%E6%B0%9F%E8%A5%BF%E6%B1%80%E6%B5%B7%20-%20i%20want.jpg!p50",
        audio: "https://oss.ashes.vip/emo/%E6%B0%9F%E8%A5%BF%E6%B1%80%E6%B5%B7%20-%20i%20want.mp3"
    },
    {
        title: "正 在 退 出 人 類 遊 戲 ▁ ▂ ▃",
        artist: "Seto",
        cover: "https://oss.ashes.vip/emo/Seto%20-%20%E6%AD%A3%20%E5%9C%A8%20%E9%80%80%20%E5%87%BA%20%E4%BA%BA%20%E9%A1%9E%20%E9%81%8A%20%E6%88%B2%20%E2%96%81%20%E2%96%82%20%E2%96%83.jpg!p50",
        audio: "https://oss.ashes.vip/emo/Seto%20-%20%E6%AD%A3%20%E5%9C%A8%20%E9%80%80%20%E5%87%BA%20%E4%BA%BA%20%E9%A1%9E%20%E9%81%8A%20%E6%88%B2%20%E2%96%81%20%E2%96%82%20%E2%96%83.mp3"
    },
    {
        title: "海屿你",
        artist: "马也_Crabbit",
        cover: "https://oss.ashes.vip/emo/%E9%A9%AC%E4%B9%9F_Crabbit%20-%20%E6%B5%B7%E5%B1%BF%E4%BD%A0.jpg!p50",
        audio: "https://oss.ashes.vip/emo/%E9%A9%AC%E4%B9%9F_Crabbit%20-%20%E6%B5%B7%E5%B1%BF%E4%BD%A0.mp3"
    },
    {
        title: "水星记",
        artist: "郭顶",
        cover: "https://oss.ashes.vip/emo/%E9%83%AD%E9%A1%B6%20-%20%E6%B0%B4%E6%98%9F%E8%AE%B0.jpg!p50",
        audio: "https://oss.ashes.vip/emo/%E9%83%AD%E9%A1%B6%20-%20%E6%B0%B4%E6%98%9F%E8%AE%B0.mp3"
    },
    {
        title: "凄美地",
        artist: "郭顶",
        cover: "https://oss.ashes.vip/emo/%E9%83%AD%E9%A1%B6%20-%20%E5%87%84%E7%BE%8E%E5%9C%B0.jpg!p50",
        audio: "https://oss.ashes.vip/emo/%E9%83%AD%E9%A1%B6%20-%20%E5%87%84%E7%BE%8E%E5%9C%B0.mp3"
    },
    {
        title: "Asphyxia(窒息)",
        artist: "逆时针向",
        cover: "https://oss.ashes.vip/emo/%E9%80%86%E6%97%B6%E9%92%88%E5%90%91%20-%20Asphyxia%28%E7%AA%92%E6%81%AF%29.jpg!p50",
        audio: "https://oss.ashes.vip/emo/%E9%80%86%E6%97%B6%E9%92%88%E5%90%91%20-%20Asphyxia%28%E7%AA%92%E6%81%AF%29.mp3"
    },
    {
        title: "在这深夜里",
        artist: "贺仙人",
        cover: "https://oss.ashes.vip/emo/%E8%B4%BA%E4%BB%99%E4%BA%BA%20-%20%E5%9C%A8%E8%BF%99%E6%B7%B1%E5%A4%9C%E9%87%8C.jpg!p50",
        audio: "https://oss.ashes.vip/emo/%E8%B4%BA%E4%BB%99%E4%BA%BA%20-%20%E5%9C%A8%E8%BF%99%E6%B7%B1%E5%A4%9C%E9%87%8C.mp3"
    },
    {
        title: "今晚月色真美 风也溫柔",
        artist: "别网恋",
        cover: "https://oss.ashes.vip/emo/%E5%88%AB%E7%BD%91%E6%81%8B%20-%20%E4%BB%8A%E6%99%9A%E6%9C%88%E8%89%B2%E7%9C%9F%E7%BE%8E%20%E9%A3%8E%E4%B9%9F%E6%BA%AB%E6%9F%94.jpg!p50",
        audio: "https://oss.ashes.vip/emo/%E5%88%AB%E7%BD%91%E6%81%8B%20-%20%E4%BB%8A%E6%99%9A%E6%9C%88%E8%89%B2%E7%9C%9F%E7%BE%8E%20%E9%A3%8E%E4%B9%9F%E6%BA%AB%E6%9F%94.mp3"
    },
    {
        title: "Landing Guy",
        artist: "刘昊霖kidult.",
        cover: "https://oss.ashes.vip/emo/%E5%88%98%E6%98%8A%E9%9C%96kidult.%20-%20Landing%20Guy.jpg!p50",
        audio: "https://oss.ashes.vip/emo/%E5%88%98%E6%98%8A%E9%9C%96kidult.%20-%20Landing%20Guy.mp3"
    }
];

let currentTrackIndex = 0;
let isPlaying = false;

const audioPlayer = document.getElementById('audio-player');
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const progressBar = document.getElementById('progress-bar');
const progressFill = document.getElementById('progress-fill');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const playerCover = document.getElementById('player-cover');
const playerTitle = document.getElementById('player-title');
const playerArtist = document.getElementById('player-artist');
const musicGrid = document.getElementById('music-grid');

// Generate music grid items
function renderMusicGrid() {
    musicGrid.innerHTML = musicData.map((track, index) => `
        <div class="music-item" data-index="${index}">
            <img src="${track.cover}" alt="${track.title}" class="music-cover">
            <div class="music-info">
                <h3>${track.title}</h3>
                <p>${track.artist}</p>
            </div>
        </div>
    `).join('');

    // Add click listeners
    document.querySelectorAll('.music-item').forEach(item => {
        item.addEventListener('click', () => {
            const index = parseInt(item.dataset.index);
            loadTrack(index);
            playTrack();
        });
    });
}

// Load track
function loadTrack(index) {
    currentTrackIndex = index;
    const track = musicData[index];
    
    audioPlayer.src = track.audio;
    playerCover.src = track.cover;
    playerTitle.textContent = track.title;
    playerArtist.textContent = track.artist;
    
    // Update active state
    document.querySelectorAll('.music-item').forEach((item, i) => {
        item.classList.toggle('active', i === index);
    });

    // update media session metadata for connected devices
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: track.title,
            artist: track.artist,
            artwork: [
                { src: track.cover, sizes: '500x500', type: 'image/jpeg' }
            ]
        });
    }
}

// Play/Pause
function togglePlay() {
    if (isPlaying) {
        pauseTrack();
    } else {
        playTrack();
    }
}

function playTrack() {
    if (!audioPlayer.src) {
        loadTrack(0);
    }
    audioPlayer.play();
    isPlaying = true;
    document.querySelector('.play-icon').style.display = 'none';
    document.querySelector('.pause-icon').style.display = 'block';
}

function pauseTrack() {
    audioPlayer.pause();
    isPlaying = false;
    document.querySelector('.play-icon').style.display = 'block';
    document.querySelector('.pause-icon').style.display = 'none';
}

// Previous track
function prevTrack() {
    currentTrackIndex = (currentTrackIndex - 1 + musicData.length) % musicData.length;
    loadTrack(currentTrackIndex);
    if (isPlaying) playTrack();
}

// Next track
function nextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % musicData.length;
    loadTrack(currentTrackIndex);
    if (isPlaying) playTrack();
}

// Update progress bar
function updateProgress() {
    const { currentTime, duration } = audioPlayer;
    const progressPercent = (currentTime / duration) * 100;
    progressFill.style.width = `${progressPercent}%`;
    
    currentTimeEl.textContent = formatTime(currentTime);
    if (duration) {
        durationEl.textContent = formatTime(duration);
    }
}

// Format time
function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Seek
function setProgress(e) {
    const width = progressBar.clientWidth;
    const clickX = e.offsetX;
    const duration = audioPlayer.duration;
    audioPlayer.currentTime = (clickX / width) * duration;
}

// Event listeners
playBtn.addEventListener('click', togglePlay);
prevBtn.addEventListener('click', prevTrack);
nextBtn.addEventListener('click', nextTrack);
audioPlayer.addEventListener('timeupdate', updateProgress);
audioPlayer.addEventListener('ended', nextTrack);
progressBar.addEventListener('click', setProgress);

// Initialize
renderMusicGrid();
loadTrack(0); // 默认加载第一首歌

// set up Media Session action handlers so devices can control playback
if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play', playTrack);
    navigator.mediaSession.setActionHandler('pause', pauseTrack);
    navigator.mediaSession.setActionHandler('previoustrack', prevTrack);
    navigator.mediaSession.setActionHandler('nexttrack', nextTrack);
}
// Draggable player
let isDragging = false;
let currentX;
let currentY;
let initialX;
let initialY;
let xOffset = 0;
let yOffset = 0;

const floatingPlayer = document.getElementById('music-player');
const dragHandle = document.getElementById('drag-handle');

dragHandle.addEventListener('mousedown', dragStart);
document.addEventListener('mousemove', drag);
document.addEventListener('mouseup', dragEnd);

// Touch events for mobile
dragHandle.addEventListener('touchstart', dragStart);
document.addEventListener('touchmove', drag);
document.addEventListener('touchend', dragEnd);

function dragStart(e) {
    if (e.type === 'touchstart') {
        initialX = e.touches[0].clientX - xOffset;
        initialY = e.touches[0].clientY - yOffset;
    } else {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
    }

    if (e.target === dragHandle || dragHandle.contains(e.target)) {
        isDragging = true;
        floatingPlayer.style.transition = 'none';
    }
}

function drag(e) {
    if (isDragging) {
        e.preventDefault();

        if (e.type === 'touchmove') {
            currentX = e.touches[0].clientX - initialX;
            currentY = e.touches[0].clientY - initialY;
        } else {
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
        }

        xOffset = currentX;
        yOffset = currentY;

        setTranslate(currentX, currentY, floatingPlayer);
    }
}

function dragEnd(e) {
    if (isDragging) {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
        floatingPlayer.style.transition = 'box-shadow 0.3s ease';
    }
}

function setTranslate(xPos, yPos, el) {
    el.style.transform = `translate(${xPos}px, ${yPos}px)`;
}

// Scroll animations for music section - 立即显示，不需要滚动触发
gsap.set('.music-section .section-title', { opacity: 1, y: 0 });
gsap.set('.music-item', { opacity: 1, y: 0 });
gsap.set('.music-player', { opacity: 1, y: 0 });

// 添加进入动画
gsap.from('.music-section .section-title', {
    scrollTrigger: {
        trigger: '.music-section',
        start: 'top center',
        scroller: 'main',
        once: true
    },
    y: 30,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out'
});

gsap.from('.music-item', {
    scrollTrigger: {
        trigger: '.music-section',
        start: 'top center',
        scroller: 'main',
        once: true
    },
    y: 30,
    opacity: 0,
    duration: 0.6,
    stagger: 0.1,
    ease: 'power3.out',
    delay: 0.2
});

gsap.from('.music-player', {
    scrollTrigger: {
        trigger: '.music-section',
        start: 'top center',
        scroller: 'main',
        once: true
    },
    y: 30,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    delay: 0.4
});
