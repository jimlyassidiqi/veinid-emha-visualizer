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
const canvas = document.createElement('canvas');
canvas.width = UI_CONFIG.canvasSize;
canvas.height = UI_CONFIG.canvasSize;
const ctx = canvas.getContext('2d');

const dashboardTexture = new THREE.CanvasTexture(canvas);

function updateDashboardData() {
    // 1. Clear Background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Draw Industrial Grid
    ctx.strokeStyle = COLORS.gridColor;
    ctx.lineWidth = 2;
    for(let i=0; i<canvas.width; i+=80) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
    }

    // 3. Header System
    ctx.fillStyle = COLORS.neonGreen;
    ctx.font = `bold 60px ${UI_CONFIG.font}`;
    ctx.fillText('VEINID // SYSTEM V1.2', 80, 120);
    ctx.font = `30px ${UI_CONFIG.font}`;
    ctx.fillText('STATUS: MIL-SPEC NOMINAL', 80, 170);

    // 4. Data Metrics (Amps & Volts)
    ctx.font = `bold 110px ${UI_CONFIG.font}`;
    ctx.fillText(`AMPS: ${(24 + Math.random() * 0.5).toFixed(2)}A`, 80, 400);
    ctx.fillText(`VOLTS: 220.7V`, 80, 550);

    // 5. Thermal Warning (Amber)
    ctx.fillStyle = COLORS.amberWarning;
    ctx.font = `bold 110px ${UI_CONFIG.font}`;
    ctx.fillText(`TEMP: 43.1°C`, 80, 700);

    // 6. Add 2 lamp LED (Green & Red)
    const ledRadius = 35;
    const ledY = 880;

    // --- Green lamp (Nominal) ---
    ctx.save();
    ctx.beginPath();
    ctx.arc(300, ledY, ledRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#39FF14'; 
    ctx.shadowColor = '#39FF14';
    ctx.shadowBlur = 40; // Memberikan efek glow
    ctx.fill();
    ctx.restore();

    // --- Red Lamp (Warning) ---
    ctx.save();
    ctx.beginPath();
    ctx.arc(canvas.width - 300, ledY, ledRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#FF0000';
    ctx.shadowColor = '#FF0000';
    ctx.shadowBlur = 40;
    ctx.fill();
    ctx.restore();
    
    // 7. Draw Frame
    ctx.strokeStyle = COLORS.neonGreen;
    ctx.lineWidth = 15;
    ctx.strokeRect(40, 40, canvas.width-80, canvas.height-80);

    dashboardTexture.needsUpdate = true;
}

// ==========================================
// 4. LOAD 3D MODEL (.GLB)
// ==========================================
const loader = new GLTFLoader();

loader.load(
    './vein_id.glb', 
    (gltf) => {
        const model = gltf.scene;
        
        model.traverse((child) => {
            if (child.isMesh) {
                if (child.name === "Glass_display") { 
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
        console.log("Model loaded successfully");
    },
    undefined,
    (error) => console.error("Loading error:", error)
);

// ==========================================
// 5. LIGHTING SYSTEM
// ==========================================
const ambientLight = new THREE.AmbientLight(0xffffff, 10);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 25);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

const topLight = new THREE.DirectionalLight(0xffffff, 25);
topLight.position.set(0, 10, 0);
scene.add(topLight);

// ==========================================
// 6. ANIMATION LOOP & RESIZE
// ==========================================
function animate() {
    requestAnimationFrame(animate);
    
    if (Math.random() > 0.97) {
        updateDashboardData();
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