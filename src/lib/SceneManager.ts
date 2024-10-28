import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { GUI } from "dat.gui";
import { OrbitControls } from "three/examples/jsm/Addons.js";

import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/Addons.js";

export class SceneInit {
  w = window.innerWidth;
  h = window.innerHeight;

  re: THREE.Renderer;
  cam: THREE.PerspectiveCamera;
  scene: THREE.Scene;
  statsPanel: Stats;
  orbctrls: OrbitControls;
  gui: GUI;
  effectComposer: EffectComposer;
  renderPass: RenderPass;
  urbp: UnrealBloomPass;

  constructor(canvas: HTMLCanvasElement) {
    this.re = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
    });
    this.re.setSize(this.w, this.h);

    this.effectComposer = new EffectComposer(this.re as THREE.WebGLRenderer);
    const fov = 75;
    const aspect = this.w / this.h;
    const far = 1000;
    const near = 0.01;
    this.cam = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.cam.position.set(0, 0, 5);

    this.scene = new THREE.Scene();

    this.renderPass = new RenderPass(this.scene, this.cam);
    this.effectComposer.addPass(this.renderPass);
    this.urbp = new UnrealBloomPass(new THREE.Vector2(1024, 1024), 1, 0, 0);
    this.effectComposer.addPass(this.urbp);
    this.statsPanel = new Stats();
    this.gui = new GUI();
    this.orbctrls = new OrbitControls(this.cam, canvas);

    document.body.appendChild(this.statsPanel.dom);
  }

  resizeCanvas() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    if (this.cam.aspect != w / h) {
      this.cam.aspect = w / h;
      this.cam.updateProjectionMatrix();
      this.re.setSize(w, h);
    }
  }

  render() {
    // this.re.render(this.scene, this.cam);
    this.effectComposer.render();
  }
}
