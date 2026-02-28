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

// navigation links
const linkEmo = document.getElementById('link-emo');
const linkTrack = document.getElementById('link-track');

function updateNav() {
    // detect scroll inside the main container (since body overflow hidden)
    const container = document.querySelector('main');
    const scroll = container.scrollTop;
    const height = container.clientHeight;

    // determine section index by rounding nearest
    const idx = Math.round(scroll / height);
    let current;
    if (idx === 0) {
        current = 'EMO';
    } else if (idx === 1) {
        current = 'TRACK';
    } else {
        current = 'LYRICS';
    }

    // highlight links
    linkEmo.classList.toggle('active', current === 'EMO');
    linkTrack.classList.toggle('active', current === 'TRACK');
    const linkLyrics = document.getElementById('link-lyrics');
    if (linkLyrics) linkLyrics.classList.toggle('active', current === 'LYRICS');

    // dim logic: only hero is dimmed when beyond first section
    const heroSection = document.getElementById('hero');
    if (current !== 'EMO') {
        heroSection.classList.add('inactive');
    } else {
        heroSection.classList.remove('inactive');
    }
    // ensure other sections never get inactive
    document.getElementById('music').classList.remove('inactive');
    const lyricsSectionEl = document.getElementById('lyrics');
    // only show lyrics content when user is on the LYRICS section
    if (lyricsSectionEl) {
        lyricsSectionEl.classList.toggle('visible', current === 'LYRICS');
    }
}

// smooth scroll handlers on links
linkEmo.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('hero').scrollIntoView({ behavior: 'smooth' });
});
linkTrack.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('music').scrollIntoView({ behavior: 'smooth' });
});

// run on load and on main scroll
const mainContainer = document.querySelector('main');
if (mainContainer) {
    mainContainer.addEventListener('scroll', updateNav, { passive: true });
    // Use IntersectionObserver for more reliable section detection (especially for LYRICS)
    const sections = Array.from(mainContainer.querySelectorAll('section'));
    const obsOptions = {
        root: mainContainer,
        threshold: [0.25, 0.5, 0.75]
    };
    const sectionVisibility = new Map();
    const io = new IntersectionObserver((entries) => {
        entries.forEach(ent => {
            sectionVisibility.set(ent.target.id, ent.intersectionRatio || 0);
        });
        // pick section with highest intersectionRatio
        let bestId = null;
        let bestRatio = -1;
        for (const [id, ratio] of sectionVisibility.entries()) {
            if (ratio > bestRatio) {
                bestRatio = ratio;
                bestId = id;
            }
        }
        if (bestId) {
            // map id to current string used by updateNav
            const map = { hero: 'EMO', music: 'TRACK', lyrics: 'LYRICS' };
            const inferred = map[bestId] || 'EMO';
            // apply same effects as updateNav would for this current
            linkEmo.classList.toggle('active', inferred === 'EMO');
            linkTrack.classList.toggle('active', inferred === 'TRACK');
            const linkLyrics = document.getElementById('link-lyrics');
            if (linkLyrics) linkLyrics.classList.toggle('active', inferred === 'LYRICS');

            const heroSection = document.getElementById('hero');
            if (heroSection) {
                if (inferred !== 'EMO') heroSection.classList.add('inactive');
                else heroSection.classList.remove('inactive');
            }
            const musicEl = document.getElementById('music');
            if (musicEl) musicEl.classList.remove('inactive');
            const lyricsSectionEl = document.getElementById('lyrics');
            if (lyricsSectionEl) lyricsSectionEl.classList.toggle('visible', inferred === 'LYRICS');
        }
    }, obsOptions);

    sections.forEach(s => {
        sectionVisibility.set(s.id, 0);
        io.observe(s);
    });
}
window.addEventListener('DOMContentLoaded', updateNav);


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
        ,
        lyrics: `[offset:0]
[ti:grief]
[length:185]
[al:grief]
[ar:Madi Marie]
[00:00.000]grief - Madi Marie
[00:00.000][tr:zh-Hans]QQ音乐享有本翻译作品的著作权
[00:06.900]I was traumatized
[00:06.900][tr:zh-Hans]遭受重创
[00:30.910]And I was traumatized
[00:30.910][tr:zh-Hans]我似乎遭受重创
[00:34.860]Once I realized you were gone
[00:34.860][tr:zh-Hans]在我意识到你已离开我
[00:38.530]Life flys by
[00:38.530][tr:zh-Hans]人生沧海桑田
[00:42.440]Like a blink of an eye
[00:42.440][tr:zh-Hans]眨眼之间瞬息万变
[00:46.290]And I hear your voice
[00:46.290][tr:zh-Hans]睡梦中
[00:50.070]In my dreams when I sleep night
[00:50.070][tr:zh-Hans]依稀间仿佛听见你的声音
[00:53.950]And I cry when I wake
[00:53.950][tr:zh-Hans]梦中惊醒 却是泪流满面
[00:57.760]Knowing you're not by my side
[00:57.760][tr:zh-Hans]我深知你已不再我身边
[01:01.580]But at least I can see you in my dreams
[01:01.580][tr:zh-Hans]但至少 还能在梦里相见
[01:05.380]An alternate reality of your being
[01:05.380][tr:zh-Hans]你存在于另一平行世界
[01:16.600]And I cannot see
[01:16.600][tr:zh-Hans]只是我看不见
[01:20.640]Or dream of you not with me
[01:20.640][tr:zh-Hans]或只是梦里你已不再我身边
[01:24.070]Your were my best friend
[01:24.070][tr:zh-Hans]你曾是我挚友
[01:28.010]The only one family who got me
[01:28.010][tr:zh-Hans]唯一一个有我存在的家
[01:31.900]And I just wanna say I'm sorry
[01:31.900][tr:zh-Hans]我只是想说声抱歉
[01:35.650]For all the things I did and being angry
[01:35.650][tr:zh-Hans]为我曾经的所作所为还有我所发的脾气
[01:39.470]And I wish I could go back it haunts me
[01:39.470][tr:zh-Hans]多希望能重回过去 回忆总是纠缠不休
[01:43.270]But just know that I will love you eternally
[01:43.270][tr:zh-Hans]而你要知道 我会永远爱你
[01:47.130]And I just wanna say I'm sorry
[01:47.130][tr:zh-Hans]我只是想说声抱歉
[01:50.870]For all the things I did and being angry
[01:50.870][tr:zh-Hans]为我曾经的所作所为还有我所发的脾气
[01:54.670]And I wish I could go back it haunts me
[01:54.670][tr:zh-Hans]多希望能重回过去 回忆总是纠缠不休
[01:58.490]But just know that I will love you eternally
[01:58.490][tr:zh-Hans]而你要知道 我会永远爱你
[02:08.820]Oooh oooh oooh
[02:33.190]And I just want you to know
[02:33.190][tr:zh-Hans]我只想让你知道
[02:37.430]That I'm sorry and I always loved you
[02:37.430][tr:zh-Hans]我真的很抱歉 但我一直深爱着你
[02:41.760]And everyday I wish I could go back
[02:41.760][tr:zh-Hans]每时每刻 我都希望能回到过去
[02:44.990]To tell you the things I always wanted to
[02:44.990][tr:zh-Hans]把一切想说的都告诉你
[02:49.500]I miss your hugs your love your support
[02:49.500][tr:zh-Hans]我想念你的拥抱 你的爱 你的支持
[02:55.850]I'll never forget you
[02:55.850][tr:zh-Hans]我永远不会忘记你
[02:58.920]I love you
[02:58.920][tr:zh-Hans]我爱你`
    },
    {
        title: "As the World Caves In (Wuki Remix)",
        artist: "Sarah Cothran、Wuki",
        cover: "https://oss.ashes.vip/emo/Sarah%20Cothran%E3%80%81Wuki%20-%20As%20the%20World%20Caves%20In%20%28Wuki%20Remix%29.jpg!p50",
        audio: "https://oss.ashes.vip/emo/Sarah%20Cothran%E3%80%81Wuki%20-%20As%20the%20World%20Caves%20In%20%28Wuki%20Remix%29.mp3",
        lyrics: `[ti:As the World Caves In]
[al:As the World Caves In (Wuki Remix)]
[length:161]
[ar:Sarah Cothran]
[offset:0]
[00:00.000]As the World Caves In - Sarah Cothran
[00:00.000][tr:zh-Hans]QQ音乐享有本翻译作品的著作权
[00:00.460]Composed by：Matt Maltese
[00:00.730]My feet are aching
[00:00.730][tr:zh-Hans]我的双脚疼痛不已
[00:03.670]
[00:04.440]And your back is pretty tired
[00:04.440][tr:zh-Hans]你的后背疲惫不堪
[00:07.480]
[00:08.190]And we've drunk a couple bottles babe
[00:08.190][tr:zh-Hans]我们开怀畅饮 宝贝
[00:11.350]
[00:12.580]And set our grief aside
[00:12.580][tr:zh-Hans]将我们的悲伤忘却
[00:15.050]
[00:16.500]The papers say it's doomsday
[00:16.500][tr:zh-Hans]报纸说世界末日来临
[00:19.430]
[00:20.150]The button has been pressed
[00:20.150][tr:zh-Hans]已经将按钮按下
[00:22.890]
[00:23.650]We're gonna nuke each other up boys
[00:23.650][tr:zh-Hans]我们将会自相残杀
[00:26.720]
[00:27.650]'Til old Satan stands impressed
[00:27.650][tr:zh-Hans]直到撒旦也瞠目结舌
[00:30.620]
[00:32.710]And here it is our final night alive
[00:32.710][tr:zh-Hans]这是我们此生的最后一晚
[00:39.250]As the earth burns to the ground
[00:39.250][tr:zh-Hans]当大地焚毁殆尽
[00:44.650]Oh boy it's you that I lie with
[00:44.650][tr:zh-Hans]天啊 我与你依偎在一起
[00:54.670]As the atom bomb locks in
[00:54.670][tr:zh-Hans]当原子弹锁紧目标 一触即发时
[01:02.070]Oh boy it's you I watch TV with
[01:02.070][tr:zh-Hans]天啊 我与你一起看着电视
[01:10.130]As the world as the world caves in
[01:10.130][tr:zh-Hans]当世界轰然崩塌
[01:19.410]
[01:20.310]You put your finest suit on
[01:20.310][tr:zh-Hans]你穿上精致的礼服
[01:23.280]
[01:23.790]I paint my fingernails
[01:23.790][tr:zh-Hans]我涂上美美的指甲油
[01:26.740]
[01:27.720]Oh we're going out in style babe
[01:27.720][tr:zh-Hans]我们精心打扮 走出家门 宝贝
[01:31.410]And everything's on sale
[01:31.410][tr:zh-Hans]所有东西都在打折出售
[01:34.320]
[01:35.570]We creep up on extinction
[01:35.570][tr:zh-Hans]我们不知不觉地走向灭亡
[01:39.170]I pull your arms right in
[01:39.170][tr:zh-Hans]我与你紧紧相拥
[01:42.280]
[01:43.370]I weep and say goodnight love
[01:43.370][tr:zh-Hans]我潸然泪下 道着晚安 我的爱人
[01:46.710]While my organs pack it in
[01:46.710][tr:zh-Hans]当我的五脏六腑慢慢衰亡时
[01:49.950]
[01:52.090]And here it is our final night alive
[01:52.090][tr:zh-Hans]这是我们此生的最后一晚
[01:58.410]And as the earth burns to the ground
[01:58.410][tr:zh-Hans]当大地焚毁殆尽
[02:03.990]Oh boy it's you that I lie with
[02:03.990][tr:zh-Hans]天啊 我与你依偎在一起
[02:14.080]As the atom bomb locks in
[02:14.080][tr:zh-Hans]当原子弹锁紧目标 一触即发时
[02:21.410]Oh boy it's you I watch TV with
[02:21.410][tr:zh-Hans]天啊 我与你一起看着电视
[02:29.590]As the world as the world caves in
[02:29.590][tr:zh-Hans]当世界轰然崩塌`
    },
    {
        title: "i want",
        artist: "氟西汀海",
        cover: "https://oss.ashes.vip/emo/%E6%B0%9F%E8%A5%BF%E6%B1%80%E6%B5%B7%20-%20i%20want.jpg!p50",
        audio: "https://oss.ashes.vip/emo/%E6%B0%9F%E8%A5%BF%E6%B1%80%E6%B5%B7%20-%20i%20want.mp3",
        lyrics: ``
    },
    {
        title: "正 在 退 出 人 類 遊 戲 ▁ ▂ ▃",
        artist: "Seto",
        cover: "https://oss.ashes.vip/emo/Seto%20-%20%E6%AD%A3%20%E5%9C%A8%20%E9%80%80%20%E5%87%BA%20%E4%BA%BA%20%E9%A1%9E%20%E9%81%8A%20%E6%88%B2%20%E2%96%81%20%E2%96%82%20%E2%96%83.jpg!p50",
        audio: "https://oss.ashes.vip/emo/Seto%20-%20%E6%AD%A3%20%E5%9C%A8%20%E9%80%80%20%E5%87%BA%20%E4%BA%BA%20%E9%A1%9E%20%E9%81%8A%20%E6%88%B2%20%E2%96%81%20%E2%96%82%20%E2%96%83.mp3",
        lyrics: ``
    },
    {
        title: "海屿你",
        artist: "马也_Crabbit",
        cover: "https://oss.ashes.vip/emo/%E9%A9%AC%E4%B9%9F_Crabbit%20-%20%E6%B5%B7%E5%B1%BF%E4%BD%A0.jpg!p50",
        audio: "https://oss.ashes.vip/emo/%E9%A9%AC%E4%B9%9F_Crabbit%20-%20%E6%B5%B7%E5%B1%BF%E4%BD%A0.mp3",
        lyrics: ``
    },
    {
        title: "水星记",
        artist: "郭顶",
        cover: "https://oss.ashes.vip/emo/%E9%83%AD%E9%A1%B6%20-%20%E6%B0%B4%E6%98%9F%E8%AE%B0.jpg!p50",
        audio: "https://oss.ashes.vip/emo/%E9%83%AD%E9%A1%B6%20-%20%E6%B0%B4%E6%98%9F%E8%AE%B0.mp3",
        lyrics: ``
    },
    {
        title: "凄美地",
        artist: "郭顶",
        cover: "https://oss.ashes.vip/emo/%E9%83%AD%E9%A1%B6%20-%20%E5%87%84%E7%BE%8E%E5%9C%B0.jpg!p50",
        audio: "https://oss.ashes.vip/emo/%E9%83%AD%E9%A1%B6%20-%20%E5%87%84%E7%BE%8E%E5%9C%B0.mp3",
        lyrics: ``
    },
    {
        title: "Asphyxia(窒息)",
        artist: "逆时针向",
        cover: "https://oss.ashes.vip/emo/%E9%80%86%E6%97%B6%E9%92%88%E5%90%91%20-%20Asphyxia%28%E7%AA%92%E6%81%AF%29.jpg!p50",
        audio: "https://oss.ashes.vip/emo/%E9%80%86%E6%97%B6%E9%92%88%E5%90%91%20-%20Asphyxia%28%E7%AA%92%E6%81%AF%29.mp3",
        lyrics: ``
    },
    {
        title: "在这深夜里",
        artist: "贺仙人",
        cover: "https://oss.ashes.vip/emo/%E8%B4%BA%E4%BB%99%E4%BA%BA%20-%20%E5%9C%A8%E8%BF%99%E6%B7%B1%E5%A4%9C%E9%87%8C.jpg!p50",
        audio: "https://oss.ashes.vip/emo/%E8%B4%BA%E4%BB%99%E4%BA%BA%20-%20%E5%9C%A8%E8%BF%99%E6%B7%B1%E5%A4%9C%E9%87%8C.mp3",
        lyrics: ``
    },
    {
        title: "今晚月色真美 风也溫柔",
        artist: "别网恋",
        cover: "https://oss.ashes.vip/emo/%E5%88%AB%E7%BD%91%E6%81%8B%20-%20%E4%BB%8A%E6%99%9A%E6%9C%88%E8%89%B2%E7%9C%9F%E7%BE%8E%20%E9%A3%8E%E4%B9%9F%E6%BA%AB%E6%9F%94.jpg!p50",
        audio: "https://oss.ashes.vip/emo/%E5%88%AB%E7%BD%91%E6%81%8B%20-%20%E4%BB%8A%E6%99%9A%E6%9C%88%E8%89%B2%E7%9C%9F%E7%BE%8E%20%E9%A3%8E%E4%B9%9F%E6%BA%AB%E6%9F%94.mp3",
        lyrics: ``
    },
    {
        title: "Landing Guy",
        artist: "刘昊霖kidult.",
        cover: "https://oss.ashes.vip/emo/%E5%88%98%E6%98%8A%E9%9C%96kidult.%20-%20Landing%20Guy.jpg!p50",
        audio: "https://oss.ashes.vip/emo/%E5%88%98%E6%98%8A%E9%9C%96kidult.%20-%20Landing%20Guy.mp3",
        lyrics: ``
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
    // populate lyrics area (if present) and prepare for syncing
    const lyricsEl = document.getElementById('lyrics-content');
    if (lyricsEl) {
        if (track.lyrics) {
            renderLyrics(track.lyrics);
        } else {
            lyricsEl.innerHTML = '';
        }
    }
    
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

// --- Lyrics parsing & rendering ---
let parsedLyrics = [];
let currentLyricIndex = -1;
let currentLyricGroup = -1;

function parseLRC(raw) {
    const lines = raw.split(/\r?\n/);
    const entries = [];
    const timeTagRe = /\[(\d{2}):(\d{2}\.\d{2,3})\]/g;

    for (const line of lines) {
        let matches;
        const times = [];
        timeTagRe.lastIndex = 0;
        while ((matches = timeTagRe.exec(line)) !== null) {
            const min = parseInt(matches[1], 10);
            const sec = parseFloat(matches[2]);
            times.push(min * 60 + sec);
        }
        if (times.length === 0) continue;
        // text after last bracket
        const lastBracket = line.lastIndexOf(']');
        const text = line.slice(lastBracket + 1).trim();
        // detect if this line is a translation (contains [tr:...])
        const isTranslation = /\[tr:[^\]]+\]/.test(line);
        for (const t of times) {
            entries.push({ time: t, text, isTranslation: isTranslation });
        }
    }
    // sort by time
    entries.sort((a, b) => a.time - b.time);
    // assign group ids for identical timestamps (so bilingual lines share a group)
    let groupId = 0;
    for (let i = 0; i < entries.length; i++) {
        if (i > 0 && Math.abs(entries[i].time - entries[i - 1].time) < 0.001) {
            entries[i].group = entries[i - 1].group;
        } else {
            entries[i].group = groupId++;
        }
    }
    return entries;
}

function renderLyrics(raw) {
    const container = document.getElementById('lyrics-content');
    if (!container) return;
    parsedLyrics = parseLRC(raw);
    currentLyricIndex = -1;
    container.innerHTML = parsedLyrics.map((entry, i) => {
        const safeText = entry.text || '';
        const cls = entry.isTranslation ? 'lyric-line translation' : 'lyric-line';
        return `<div class="${cls}" data-time="${entry.time}" data-index="${i}" data-group="${entry.group}">${escapeHtml(safeText)}</div>`;
    }).join('');
    
    // reset scroll to top when loading new lyrics
    container.scrollTop = 0;

    // click-to-seek
    container.querySelectorAll('.lyric-line').forEach(el => {
        el.addEventListener('click', (e) => {
            const t = parseFloat(el.dataset.time);
            if (!isNaN(t)) {
                audioPlayer.currentTime = t + 0.01;
            }
        });
    });
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function syncLyrics() {
    if (!parsedLyrics || parsedLyrics.length === 0) return;
    const time = audioPlayer.currentTime;
    // find the highest index with time <= currentTime
    let newIndex = currentLyricIndex;
    // fast forward search
    if (newIndex < 0) newIndex = 0;
    while (newIndex < parsedLyrics.length - 1 && parsedLyrics[newIndex + 1].time <= time) {
        newIndex++;
    }
    // or backward search
    while (newIndex > 0 && parsedLyrics[newIndex].time > time) {
        newIndex--;
    }

    if (newIndex !== currentLyricIndex) {
        const container = document.getElementById('lyrics-content');
        if (!container) return;
        // determine group for newIndex
        const newGroup = parsedLyrics[newIndex] && parsedLyrics[newIndex].group;
        if (newGroup == null) return;

        // remove active from any previous lines
        container.querySelectorAll('.lyric-line.active').forEach(el => el.classList.remove('active'));

        // add active to all lines in the new group
        const groupEls = container.querySelectorAll(`.lyric-line[data-group="${newGroup}"]`);
        groupEls.forEach(el => el.classList.add('active'));

        // auto-scroll: keep the current lyric line near the top
        if (groupEls.length > 0) {
            const first = groupEls[0];
            const offset = 40;
            // compute position relative to container instead of relying on offsetParent
            const containerRect = container.getBoundingClientRect();
            const lineRect = first.getBoundingClientRect();
            // distance from top of container to the lyric line, plus any existing scroll
            let targetScroll = lineRect.top - containerRect.top + container.scrollTop - offset;
            if (targetScroll < 0) targetScroll = 0;
            
            // clamp to valid scroll range
            const maxScroll = Math.max(0, container.scrollHeight - container.clientHeight);
            const clampedScroll = Math.min(targetScroll, maxScroll);
            
            // use requestAnimationFrame to ensure layout is updated before scrolling
            requestAnimationFrame(() => {
                // smoothness could be adjusted if desired
                container.scrollTop = clampedScroll;
            });
        }

        currentLyricIndex = newIndex;
        currentLyricGroup = newGroup;
    }
}

// attach sync handler
audioPlayer.addEventListener('timeupdate', syncLyrics);

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
