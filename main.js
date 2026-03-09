/**
 * PROJECT: VEINID INDUSTRIAL DASHBOARD (PROVING GROUND)
 * AUTHOR: ACHMAD JIMLY ASSIDIQI
 * STYLE: MILITARY-GRADE EUROPEAN DEEP-TECH
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// ==========================================
// 1. CONFIGURATION & CONSTANTS
// ==========================================
const COLORS = {
    background: 0x000000,
    metal: 0x222222,
    neonGreen: '#39FF14',
    amberWarning: '#FFBF00',
    gridColor: '#111111'
};

const UI_CONFIG = {
    canvasSize: 1024, // High resolution for sharp text
    font: 'JetBrains Mono, Roboto Mono, monospace'
};

const GRID_CONFIG = {
    size: 200,
    divisions: 80,
    scrollSpeed: 0.5,
    height: -2
};

const GLASS_CONFIG = {
    radius: 0.5,      
    posX: 0,         
    posY: 0,        
    posZ: 0.22,       
    opacity: 0.4 
};

// ==========================================
// 2. SCENE SETUP
// ==========================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(COLORS.background);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = THREE.ReinhardToneMapping;
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(2, 2, 4);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// ==========================================
// 3. DYNAMIC UI DASHBOARD (Canvas Texture)
// ==========================================
let dashboardEnabled = true;

const canvas = document.createElement('canvas');
canvas.width = UI_CONFIG.canvasSize;
canvas.height = UI_CONFIG.canvasSize;
const ctx = canvas.getContext('2d');

const dashboardTexture = new THREE.CanvasTexture(canvas);
dashboardTexture.transformUv = (uv) => {
    uv.x = 1 - uv.x;
    uv.y = 1 - uv.y;
};

function updateDashboardData() {
    if (!dashboardEnabled) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        dashboardTexture.needsUpdate = true;
        return;
    }
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const circleRadius = canvas.width / 2 - 60;

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = COLORS.gridColor;
    ctx.lineWidth = 2;
    for(let i=0; i<canvas.width; i+=80) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.lineTo(canvas.width, i); ctx.stroke();
    }

    ctx.fillStyle = COLORS.neonGreen;
    ctx.font = `bold 50px ${UI_CONFIG.font}`;
    ctx.textAlign = 'center';
    ctx.fillText('VEINID // SYSTEM V1.2', centerX, centerY - 280);
    ctx.font = `25px ${UI_CONFIG.font}`;
    ctx.fillText('STATUS: MIL-SPEC NOMINAL', centerX, centerY - 240);

    ctx.font = `bold 90px ${UI_CONFIG.font}`;
    ctx.fillText(`AMPS: ${(24 + Math.random() * 0.5).toFixed(2)}A`, centerX, centerY - 100);
    ctx.fillText(`VOLTS: 220.7V`, centerX, centerY + 30);

    ctx.fillStyle = COLORS.amberWarning;
    ctx.font = `bold 90px ${UI_CONFIG.font}`;
    ctx.fillText(`TEMP: 43.1°C`, centerX, centerY + 160);

    const ledRadius = 30;
    const ledY = centerY + 250;

    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX - 150, ledY, ledRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#39FF14'; 
    ctx.shadowColor = '#39FF14';
    ctx.shadowBlur = 40;
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX + 150, ledY, ledRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#FF0000';
    ctx.shadowColor = '#FF0000';
    ctx.shadowBlur = 40;
    ctx.fill();
    ctx.restore();
    
    ctx.strokeStyle = COLORS.neonGreen;
    ctx.lineWidth = 15;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, circleRadius, circleRadius, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.textAlign = 'left';
    dashboardTexture.needsUpdate = true;
}

// ==========================================
// 4. LOAD 3D MODEL (.GLB)
// ==========================================
const loader = new GLTFLoader();

let model = null;
let frontGlass = null;
let dashboardMesh = null;
let modelAnimationComplete = false;
let modelScale = 0;

loader.load(
    './vein_id2.glb', 
    (gltf) => {
        model = gltf.scene;
        model.scale.set(0, 0, 0);
        
        model.traverse((child) => {
            if (child.isMesh) {
                if (child.name === "Glass_display") { 
                    dashboardMesh = child;
                    child.material = new THREE.MeshStandardMaterial({
                        map: dashboardTexture,
                        emissiveMap: dashboardTexture,
                        emissive: new THREE.Color(0xffffff),
                        emissiveIntensity: 0.8,
                        roughness: 0.1,
                        metalness: 1
                    });
                } else {
                    child.material = new THREE.MeshStandardMaterial({
                        color: 0x1a1a1a,
                        metalness: 1,
                        roughness: 0.3
                    });
                }
            }
        });

        scene.add(model);

        const glassGeometry = new THREE.CircleGeometry(GLASS_CONFIG.radius, 64);
        const glassMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xccffff,
            metalness: 0.0,
            roughness: 0.0,
            transparent: true,
            opacity: GLASS_CONFIG.opacity,
            transmission: 0.7,
            thickness: 0.2,
            clearcoat: 1.0,
            clearcoatRoughness: 0.0,
            side: THREE.DoubleSide,
            depthWrite: false
        });

        const frontGlass = new THREE.Mesh(glassGeometry, glassMaterial);
        frontGlass.position.set(GLASS_CONFIG.posX, GLASS_CONFIG.posY, GLASS_CONFIG.posZ);
        frontGlass.renderOrder = 999;
        scene.add(frontGlass);
        
        console.log("Glass added to scene at position:", frontGlass.position);
        console.log("Model loaded successfully");
    },
    undefined,
    (error) => console.error("Loading error:", error)
);

// ==========================================
// 5. LIGHTING SYSTEM
// ==========================================
const ambientLight = new THREE.AmbientLight(0xffffff, 15);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 30);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

const topLight = new THREE.DirectionalLight(0xffffff, 30);
topLight.position.set(0, 10, 0);
scene.add(topLight);

const frontLight = new THREE.PointLight(0x88ffff, 10);
frontLight.position.set(0, 2, 3);
scene.add(frontLight);

// ==========================================
// 5. MOVING NEON GRID BACKGROUND
// ==========================================
const movingGrid = new THREE.GridHelper(
    GRID_CONFIG.size,
    GRID_CONFIG.divisions,
    COLORS.neonGreen,
    COLORS.neonGreen
);

movingGrid.position.y = GRID_CONFIG.height;

// Ensure materials are semi-transparent and neon colored
if (Array.isArray(movingGrid.material)) {
    movingGrid.material.forEach((mat) => {
        mat.transparent = true;
        mat.opacity = 0.25;
        mat.color = new THREE.Color(COLORS.neonGreen);
    });
} else {
    movingGrid.material.transparent = true;
    movingGrid.material.opacity = 0.25;
    movingGrid.material.color = new THREE.Color(COLORS.neonGreen);
}

scene.add(movingGrid);

// ==========================================
// 6. ANIMATION LOOP & RESIZE
// ==========================================
function animate() {
    requestAnimationFrame(animate);
    
    if (!modelAnimationComplete && model) {
        modelScale += 0.03;
        if (modelScale >= 1) {
            modelScale = 1;
            modelAnimationComplete = true;
        }
        
        const easeOut = 1 - Math.pow(1 - modelScale, 3);
        model.scale.set(easeOut, easeOut, easeOut);
        
        model.position.y = -0.5 * (1 - easeOut);
    }
    
    if (Math.random() > 0.97) {
        updateDashboardData();
    }

    // Move the neon grid backwards to create depth motion
    movingGrid.position.z -= GRID_CONFIG.scrollSpeed * 0.1;
    if (movingGrid.position.z < -GRID_CONFIG.size / 2) {
        movingGrid.position.z = 0;
    }
    
    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// START
updateDashboardData();
animate();

// ==========================================
// LOADING SCREEN HANDLER
// ==========================================
const loadingScreen = document.getElementById('loading-screen');

function startLoadingSequence() {
    setTimeout(() => {
        loadingScreen.classList.add('start-animate');
        
        setTimeout(() => {
            loadingScreen.classList.add('fade-out');
            
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                showToggleButton();
            }, 800);
        }, 3000);
    }, 100);
}

startLoadingSequence();

// ==========================================
// DASHBOARD TOGGLE BUTTON
// ==========================================
const dashboardToggle = document.getElementById('dashboard-toggle');

function showToggleButton() {
    dashboardToggle.classList.add('visible');
}

dashboardToggle.addEventListener('click', () => {
    dashboardEnabled = !dashboardEnabled;
    dashboardToggle.textContent = dashboardEnabled ? 'DASHBOARD: ON' : 'DASHBOARD: OFF';
    dashboardToggle.classList.toggle('active', dashboardEnabled);
    
    if (dashboardMesh) {
        dashboardMesh.visible = dashboardEnabled;
    }
    
    updateDashboardData();
});