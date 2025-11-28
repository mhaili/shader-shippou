import * as THREE from 'three';
import { loadShaders } from './utils/shaderLoader';

class ShaderApp {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private uniforms: { [key: string]: any };
  private mesh: THREE.Mesh | null = null;
  private isPaused = false;
  private lastFrameTime = performance.now();
  private frameCount = 0;
  private lastFpsUpdate = performance.now();

  constructor() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    
    this.uniforms = {
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uClick: { value: 0 },
      uMode: { value: 0 }
    };

    this.init();
  }

  private init() {
    const shaders = loadShaders();
    
    const material = new THREE.ShaderMaterial({
      vertexShader: shaders.vertex,
      fragmentShader: shaders.fragment,
      uniforms: this.uniforms
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);

    this.setupEventListeners();
    this.setupUI();
    requestAnimationFrame(this.animate);
  }

  private setupEventListeners() {
    window.addEventListener('resize', () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
    });

    window.addEventListener('pointermove', (e) => {
      const x = e.clientX / window.innerWidth;
      const y = 1 - e.clientY / window.innerHeight;
      this.uniforms.uMouse.value.set(x, y);
    }, { passive: true });

    window.addEventListener('mousedown', () => {
      this.uniforms.uClick.value = 1;
      setTimeout(() => this.uniforms.uClick.value = 0, 180);
    }, { passive: true });

    window.addEventListener('keydown', (e) => {
      if (e.key === '1') this.uniforms.uMode.value = 0;
      if (e.key === '2') this.uniforms.uMode.value = 1;
      if (e.key === '3') this.uniforms.uMode.value = 2;
      
      if (e.key === ' ') {
        e.preventDefault();
        this.isPaused = !this.isPaused;
        const pauseBtn = document.getElementById('btnPause') as HTMLButtonElement;
        pauseBtn.textContent = this.isPaused ? '▶ Resume' : '⏸ Pause';
      }
    });
  }

  private setupUI() {
    const pauseButton = document.getElementById('btnPause') as HTMLButtonElement;
    const modeSelector = document.getElementById('selMode') as HTMLSelectElement;

    pauseButton.onclick = () => {
      this.isPaused = !this.isPaused;
      pauseButton.textContent = this.isPaused ? '▶ Resume' : '⏸ Pause';
    };

    modeSelector.onchange = () => {
      this.uniforms.uMode.value = parseInt(modeSelector.value, 10);
    };
  }

  private animate = (currentTime: number) => {
    this.frameCount++;
    
    if (currentTime - this.lastFpsUpdate > 500) {
      const fps = Math.round(this.frameCount * 1000 / (currentTime - this.lastFpsUpdate));
      const fpsDisplay = document.getElementById('fps') as HTMLSpanElement;
      fpsDisplay.textContent = `FPS: ${fps}`;
      this.frameCount = 0;
      this.lastFpsUpdate = currentTime;
    }
    
    if (!this.isPaused) {
      this.uniforms.uTime.value += (currentTime - this.lastFrameTime) * 0.001;
      this.renderer.render(this.scene, this.camera);
    }
    
    this.lastFrameTime = currentTime;
    requestAnimationFrame(this.animate);
  };
}

new ShaderApp();