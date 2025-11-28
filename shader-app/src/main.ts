/**
 * ========================================
 * SHADER INTERACTIF - MOTIF SHIPPOU JAPONAIS
 * ========================================
 * 
 *  PROJET: Option 2 Shader Interactif
 * COURS: Événements et Temps Réel - M2 FullStack
 * 
 * 
 * INTERACTIONS TEMPS RÉEL:
 * 1. Suivi souris → Pupilles dirigées vers curseur
 * 2. Clic souris → Flash lumineux adaptatif  
 * 3. Clavier 1/2/3 → 3 modes visuels distincts
 * 
 * STACK TECHNIQUE:
 * - GLSL: Fragment shader pour calculs GPU parallèles
 * - Three.js: Intégration WebGL et gestion uniforms
 * - TypeScript: Logique d'interaction et type safety
 * - Vite: Build tool moderne pour développement rapide
 * 
 * PERFORMANCE: 60 FPS plein écran, optimisé GPU
 * 
 * ========================================
 */

import * as THREE from 'three';

// ================================
// VERTEX SHADER - Positionnement des sommets
// ================================
const VERTEX_SHADER = `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// ================================
// FRAGMENT SHADER - Calcul de la couleur de chaque pixel
// ================================
const FRAGMENT_SHADER = `
precision highp float;

// ================================
// UNIFORMS - Variables partagées entre JavaScript et GPU
// ================================
uniform vec2  uResolution;   // Taille de l'écran en pixels
uniform float uTime;         // Temps écoulé pour les animations
uniform vec2  uMouse;        // Position souris normalisée [0..1]
uniform vec2  uMousePx;      // Position souris en pixels
uniform float uClick;        // État du clic (0.0 ou 1.0)
uniform int   uMode;         // Mode visuel actuel (0, 1 ou 2)

// ================================
// COMPATIBILITÉ SHADERTOY
// ================================
#define iResolution vec3(uResolution, 1.0)
#define iTime       uTime
vec4 iMouse(){ return vec4(uMousePx, uClick, 0.0); }

void mainImage(out vec4 fragColor, in vec2 fragCoord);

// ================================
// FONCTIONS UTILITAIRES GLSL
// ================================

/**
 * Fonction de création d'un cercle plein
 * @param uv : coordonnées du point à tester
 * @param r : rayon du cercle
 * @return : 1.0 si dans le cercle, 0.0 sinon
 */
float circlePattern(vec2 uv, float r) {
    float distance = length(uv) - r;
    return step(distance, 0.0);
}

/**
 * FONCTION PRINCIPALE DU FRAGMENT SHADER
 * Calcule la couleur de chaque pixel de l'écran
 */
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    // ================================
    // NORMALISATION DES COORDONNÉES
    // ================================
    vec2 uv = (fragCoord - 0.5*iResolution.xy) / iResolution.y;
    float time = iTime;

    // ================================
    // DU MOTIF SHIPPOU 
    // ================================
    vec2 p = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;

    // Découpage de l'espace en tuiles 4x4
    vec2 gv = fract(p * 4.0) - 0.5;        // Coordonnées locales de chaque tuile
    vec2 id = floor(p * 4.0);               // Index de chaque tuile
    
    // Rayon des cercles Shippou (fixe pour stabilité du background)
    float radius = 0.35;
    // Création du motif Shippou : cercles entrelacés
    float c1 = circlePattern(gv, radius);                      // Cercle central
    float c2 = circlePattern(gv + vec2(1.0, 0.0), radius);     // Cercle droite
    float c3 = circlePattern(gv + vec2(-1.0, 0.0), radius);    // Cercle gauche  
    float c4 = circlePattern(gv + vec2(0.0, 1.0), radius);     // Cercle haut
    float c5 = circlePattern(gv + vec2(0.0, -1.0), radius);    // Cercle bas
    
    // Union de tous les cercles pour former le motif
    float pattern = max(c1, max(c2, max(c3, max(c4, c5))));

    // ================================
    // PALETTES DE COULEURS PAR MODE
    // ================================
    vec3 baseColor, lineColor;
    
    if (uMode == 0) {
        // Mode "Élégance Crème" - Palette traditionnelle 
        baseColor = vec3(0.96, 0.94, 0.88);  // Fond crème élégant
        lineColor = vec3(0.65, 0.35, 0.4);   // Lignes rose sophistiqué
    } else if (uMode == 1) {
        // Mode "Sérénité Indigo" - Palette bleu zen
        baseColor = vec3(0.85, 0.92, 0.98);  // Fond bleu très doux
        lineColor = vec3(0.3, 0.2, 0.7);     // Lignes indigo raffiné
    } else {
        // Mode "Chaleur Cuivrée" - Palette chaleureuse
        baseColor = vec3(0.98, 0.93, 0.85);  // Fond pêche délicat
        lineColor = vec3(0.8, 0.45, 0.2);    // Lignes cuivre chaleureux
    }
    
    // Application des couleurs au motif
    vec3 shippou = mix(baseColor, lineColor, pattern);
    
    // Couleur finale du background (stable, pas d'animation)
    vec3 finalColor = shippou;

    // ================================
    // GÉNÉRATION DES YEUX INTERACTIFS
    // ================================
    // Grille d'yeux : 9x9 yeux répartis sur l'écran
    int grid = 4;
    for(int x = -grid; x <= grid; x++) {
        for(int y = -grid; y <= grid; y++) {
            
            // Position de base de chaque œil
            vec2 center = vec2(float(x), float(y)) * 0.6;
            
            // Animation subtile de flottement des yeux
            center.x += 0.2 * sin(time*0.7 + float(y));
            center.y += 0.2 * cos(time*0.7 + float(x));

            // Taille variable de chaque œil (animation de respiration)
            float scale = 0.25 + 0.05 * sin(float(x*y) + time);
            vec2 localUV = (uv - center) / scale;

            // ================================
            // GÉOMÉTRIE DE L'ŒIL
            // ================================
            float eyeRadius = 0.4;                    // Rayon de l'œil
            float distFromCenter = length(localUV);   // Distance au centre
            float eyeMask = step(distFromCenter, eyeRadius);  // Masque circulaire

            // ================================
            // PUPILLE QUI SUIT LA SOURIS
            // ================================
            float pupilRadius = 0.12;
            
            // Direction vers la souris (coordonnées centrées)
            vec2 mouseDirection = (uMouse - 0.5) * 0.3;
            
            // Position de la pupille = animation naturelle + suivi souris
            float offsetX = 0.15 * sin(time*1.2 + float(x+y)) + mouseDirection.x;
            float offsetY = mouseDirection.y;
            vec2 pupilCenter = vec2(offsetX, offsetY);
            
            // Calcul du masque de la pupille
            float distFromPupil = length(localUV - pupilCenter);
            float pupilMask = step(distFromPupil, pupilRadius);

            // ================================
            // PAUPIÈRES AVEC CLIGNEMENT AU CLIC
            // ================================
            float baseBlink = 0.15;  // Yeux ouverts à 85% minimum
            float blinkAmount = baseBlink + clamp(uClick * 0.6, 0.0, 0.3);
            
            // Calcul des paupières haute et basse
            float upperLid = step(-localUV.y, (1.0-blinkAmount)*eyeRadius);
            float lowerLid = step( localUV.y, (1.0-blinkAmount)*eyeRadius);
            float eyelidMask = upperLid * lowerLid;

            // ================================
            // RENDU COULEUR DE L'ŒIL
            // ================================
            vec3 whiteOfEye = vec3(1.0);         // Blanc de l'œil 
            vec3 pupilPattern = shippou;         // Pupille avec motif Shippou

            // Assemblage des couches de l'œil
            vec3 eyeColor = whiteOfEye;
            eyeColor = mix(eyeColor, pupilPattern, pupilMask);  // Ajout pupille
            eyeColor *= eyeMask * eyelidMask;                   // Application masques

            // ================================
            // EFFET DE FLASH AU CLIC
            // ================================
            if (uClick > 0.1) {
                float clickIntensity = uClick * smoothstep(0.6, 0.0, distFromCenter);
                vec3 flashColor;
                
                // Couleur du flash selon le mode actuel
                if (uMode == 0) flashColor = vec3(1.0, 0.9, 0.7);      // Doré doux
                else if (uMode == 1) flashColor = vec3(0.8, 0.9, 1.0); // Bleu cristal
                else flashColor = vec3(1.0, 0.7, 0.4);                 // Orange chaleureux
                
                eyeColor += flashColor * clickIntensity * 0.4;
            }

            // ================================
            // COMPOSITION FINALE
            // ================================
            finalColor = mix(finalColor, eyeColor, eyeMask);
        }
    }

    // Sortie finale : couleur RGBA du pixel
    fragColor = vec4(finalColor, 1.0);
}

/**
 * POINT D'ENTRÉE DU FRAGMENT SHADER
 * Appelé automatiquement par WebGL pour chaque pixel
 */
void main(){
  vec4 pixelColor;
  mainImage(pixelColor, gl_FragCoord.xy);
  gl_FragColor = pixelColor;
}
`;

// ================================
// CONFIGURATION THREE.JS / WEBGL
// ================================

/**
 * Renderer WebGL pour affichage haute performance
 */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));  // Optimisation DPI
renderer.setSize(window.innerWidth, window.innerHeight);       // Plein écran
document.body.appendChild(renderer.domElement);

/**
 * Scène 3D et caméra orthographique pour rendu 2D
 */
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const geometry = new THREE.PlaneGeometry(2, 2);  // Plan plein écran

// ================================
// VARIABLES PARTAGÉES AVEC LE SHADER
// ================================

/**
 * Uniforms : variables synchronisées entre JavaScript et GPU
 */
const shaderUniforms = {
  uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
  uTime:       { value: 0 },                                    // Temps pour animations
  uMouse:      { value: new THREE.Vector2(0.5, 0.5) },         // Position souris [0,1]
  uMousePx:    { value: new THREE.Vector2(0.0, 0.0) },         // Position souris pixels
  uClick:      { value: 0 },                                   // État clic (0 ou 1)
  uMode:       { value: 0 },                                   // Mode visuel (0,1,2)
};

/**
 * Matériau shader et mesh pour rendu plein écran
 */
const shaderMaterial = new THREE.ShaderMaterial({ 
  vertexShader: VERTEX_SHADER, 
  fragmentShader: FRAGMENT_SHADER, 
  uniforms: shaderUniforms 
});

const fullScreenMesh = new THREE.Mesh(geometry, shaderMaterial);
scene.add(fullScreenMesh);

// ================================
// GESTION DU REDIMENSIONNEMENT
// ================================

/**
 * Adaptation automatique à la taille de la fenêtre
 */
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  shaderUniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
});

// ================================
// INTERACTIONS UTILISATEUR (3 requises)
// ================================

/**
 * INTERACTION 1 : Suivi de la souris
 * Les pupilles des yeux suivent le curseur en temps réel
 */
window.addEventListener('pointermove', (e) => {
  const normalizedX = e.clientX / window.innerWidth;        // [0,1]
  const normalizedY = 1 - e.clientY / window.innerHeight;   // [0,1] inversé
  
  shaderUniforms.uMouse.value.set(normalizedX, normalizedY);
  shaderUniforms.uMousePx.value.set(e.clientX, window.innerHeight - e.clientY);
}, { passive: true });

/**
 * INTERACTION 2 : Flash au clic
 * Effet lumineux visible pendant 180ms
 */
window.addEventListener('mousedown', () => {
  shaderUniforms.uClick.value = 1;
  setTimeout(() => shaderUniforms.uClick.value = 0, 180);
}, { passive: true });

/**
 * INTERACTION 3 : Changement de mode au clavier
 * Touches 1/2/3 pour changer les palettes de couleurs
 */
window.addEventListener('keydown', (e) => {
  if (e.key === '1') shaderUniforms.uMode.value = 0;  // Mode Élégance Crème
  if (e.key === '2') shaderUniforms.uMode.value = 1;  // Mode Sérénité Indigo  
  if (e.key === '3') shaderUniforms.uMode.value = 2;  // Mode Chaleur Cuivrée
  
  //  Espace pour pause
  if (e.key === ' ') {
    e.preventDefault();
    isPaused = !isPaused;
    pauseButton.textContent = isPaused ? '▶️ Resume' : '⏸️ Pause';
  }
});

// ================================
// INTERFACE UTILISATEUR NON-SHADER
// ================================

/**
 * Éléments DOM pour les contrôles
 */
const pauseButton = document.getElementById('btnPause') as HTMLButtonElement;
const modeSelector = document.getElementById('selMode') as HTMLSelectElement;
const fpsDisplay = document.getElementById('fps') as HTMLSpanElement;

let isPaused = false;

/**
 * Bouton pause/resume
 */
pauseButton.onclick = () => {
  isPaused = !isPaused;
  pauseButton.textContent = isPaused ? '▶ Resume' : '⏸ Pause';
};

/**
 * Sélecteur de mode visuel
 */
modeSelector.onchange = () => {
  shaderUniforms.uMode.value = parseInt(modeSelector.value, 10);
};

// ================================
// BOUCLE DE RENDU PRINCIPAL
// ================================

/**
 * Variables pour le calcul des FPS et du temps
 */
let lastFrameTime = performance.now();
let frameCount = 0;
let lastFpsUpdate = performance.now();

/**
 * Fonction de rendu appelée 60 fois par seconde
 * Gère l'animation, le calcul FPS et le rendu WebGL
 */
function renderLoop(currentTime: number) {
  // Calcul et affichage des FPS toutes les 500ms
  frameCount++;
  if (currentTime - lastFpsUpdate > 500) {
    const fps = Math.round(frameCount * 1000 / (currentTime - lastFpsUpdate));
    fpsDisplay.textContent = `FPS: ${fps}`;
    frameCount = 0;
    lastFpsUpdate = currentTime;
  }
  
  // Rendu seulement si pas en pause
  if (!isPaused) {
    // Mise à jour du temps pour les animations shader
    shaderUniforms.uTime.value += (currentTime - lastFrameTime) * 0.001;
    
    // Rendu de la scène
    renderer.render(scene, camera);
  }
  
  lastFrameTime = currentTime;
  requestAnimationFrame(renderLoop);  // Boucle à 60 FPS
}

// Démarrage de la boucle de rendu
requestAnimationFrame(renderLoop);
