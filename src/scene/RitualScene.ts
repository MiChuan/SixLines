import * as THREE from 'three';
import { createTurtleShell } from './shell';
import { createCoin, setCoinFace } from './coin';
import type { RitualAudio } from '../audio/synth';

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** 甲内盛币位置（世界坐标，相对 shell 组） */
const NEST: THREE.Vector3[] = [
  new THREE.Vector3(-0.22, 0.72, 0.08),
  new THREE.Vector3(0.02, 0.7, -0.12),
  new THREE.Vector3(0.24, 0.74, 0.06),
];

/** 摇出后落点：保持在画面上半，不坠入下方 UI */
const LAND: THREE.Vector3[] = [
  new THREE.Vector3(-1.05, 0.55, 0.95),
  new THREE.Vector3(0.0, 0.58, 1.15),
  new THREE.Vector3(1.05, 0.55, 0.9),
];

export class RitualScene {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;
  readonly shell: THREE.Group;
  readonly coins: THREE.Group[] = [];
  private clock = new THREE.Clock();
  private anim: null | { update: (t: number) => boolean; resolve: () => void } = null;
  private reduced = false;

  constructor(
    private host: HTMLElement,
    private audio: RitualAudio,
  ) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.setSize(host.clientWidth, host.clientHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setClearColor(0x000000, 0);
    host.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(38, host.clientWidth / Math.max(host.clientHeight, 1), 0.1, 100);
    // 俯视略前，龟甲与钱币落在上半画布中央
    this.camera.position.set(0, 3.4, 3.6);
    this.camera.lookAt(0, 0.55, 0.15);

    this.scene.fog = new THREE.FogExp2(0x0a0806, 0.035);
    this.scene.add(new THREE.AmbientLight(0x7a6a50, 0.65));
    const key = new THREE.PointLight(0xffc978, 2.8, 24);
    key.position.set(1.5, 5, 2.5);
    this.scene.add(key);
    const fill = new THREE.PointLight(0x557799, 0.7, 18);
    fill.position.set(-2.5, 2, -1.5);
    this.scene.add(fill);
    const rim = new THREE.DirectionalLight(0xd4af37, 0.45);
    rim.position.set(0, 2, -3);
    this.scene.add(rim);

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(3.2, 64),
      new THREE.MeshStandardMaterial({
        color: 0x100e0a,
        metalness: 0.25,
        roughness: 0.92,
        transparent: true,
        opacity: 0.85,
      }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.4;
    this.scene.add(ground);

    this.shell = createTurtleShell();
    this.shell.position.set(0, 0.05, 0);
    this.shell.scale.setScalar(1.05);
    this.scene.add(this.shell);

    for (let i = 0; i < 3; i++) {
      const c = createCoin();
      c.visible = false;
      c.scale.setScalar(1.15);
      this.coins.push(c);
      this.scene.add(c);
    }

    window.addEventListener('resize', () => this.onResize());
    this.loop();
  }

  private onResize(): void {
    const w = this.host.clientWidth;
    const h = Math.max(this.host.clientHeight, 1);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  private loop = (): void => {
    requestAnimationFrame(this.loop);
    const dt = this.clock.getDelta();
    const t = this.clock.elapsedTime;
    if (!this.reduced) {
      this.shell.position.y = 0.05 + Math.sin(t * 0.8) * 0.025;
      this.shell.rotation.y = Math.sin(t * 0.22) * 0.05;
    }
    if (this.anim) {
      const done = this.anim.update(dt);
      if (done) {
        const r = this.anim.resolve;
        this.anim = null;
        r();
      }
    }
    this.renderer.render(this.scene, this.camera);
  };

  private runAnim(update: (acc: number) => boolean): Promise<void> {
    return new Promise((resolve) => {
      let acc = 0;
      this.anim = {
        update: (dt) => {
          acc += dt;
          return update(acc);
        },
        resolve,
      };
    });
  }

  async playLoadCoins(): Promise<void> {
    this.coins.forEach((c, i) => {
      c.visible = true;
      c.position.set((i - 1) * 0.55, 2.8, 0.2);
      c.rotation.set(0, 0, 0);
      setCoinFace(c, true);
      c.userData.dropped = false;
    });

    await this.runAnim((acc) => {
      const total = 1.25;
      for (let i = 0; i < 3; i++) {
        const local = Math.max(0, Math.min(1, (acc - i * 0.15) / 0.7));
        const e = easeOutCubic(local);
        const start = new THREE.Vector3((i - 1) * 0.55, 2.8, 0.2);
        const p = start.clone().lerp(NEST[i]!, e);
        p.y += Math.sin(e * Math.PI) * 0.35;
        this.coins[i]!.position.copy(p);
        this.coins[i]!.rotation.z = e * Math.PI * 2;
        if (local > 0.95 && !this.coins[i]!.userData.dropped) {
          this.coins[i]!.userData.dropped = true;
          this.audio.playCoinDrop(i);
        }
      }
      return acc >= total;
    });
    this.coins.forEach((c, i) => {
      c.position.copy(NEST[i]!);
      c.userData.dropped = false;
    });
  }

  async playShakeAndToss(faces: [boolean, boolean, boolean]): Promise<void> {
    this.audio.playShake();
    const baseRot = this.shell.rotation.clone();
    await this.runAnim((acc) => {
      const shakeDur = 1.35;
      if (acc < shakeDur) {
        const damp = 1 - acc / shakeDur;
        this.shell.rotation.z = baseRot.z + Math.sin(acc * 28) * 0.16 * damp;
        this.shell.rotation.x = baseRot.x + Math.cos(acc * 22) * 0.07 * damp;
        this.coins.forEach((c, i) => {
          c.position.x = NEST[i]!.x + Math.sin(acc * 30 + i) * 0.03 * damp;
          c.rotation.z += 0.25;
        });
        return false;
      }
      return true;
    });
    this.shell.rotation.copy(baseRot);

    const starts = this.coins.map((c) => c.position.clone());
    await this.runAnim((acc) => {
      const dur = 1.35;
      const t = Math.min(1, acc / dur);
      for (let i = 0; i < 3; i++) {
        const e = easeOutCubic(Math.max(0, (t - i * 0.05) / 0.85));
        const s = starts[i]!;
        const d = LAND[i]!;
        const y = lerp(s.y, d.y, e) + Math.sin(e * Math.PI) * 0.85;
        this.coins[i]!.position.set(lerp(s.x, d.x, e), y, lerp(s.z, d.z, e));
        this.coins[i]!.rotation.x = e * Math.PI * (faces[i] ? 2 : 3);
        this.coins[i]!.rotation.y = e * Math.PI * 1.5;
        if (e > 0.92 && !this.coins[i]!.userData.landed) {
          this.coins[i]!.userData.landed = true;
          setCoinFace(this.coins[i]!, faces[i]!);
          this.coins[i]!.rotation.set(faces[i] ? -0.5 : Math.PI - 0.5, 0, (i - 1) * 0.12);
          this.audio.playLand(i);
        }
      }
      return t >= 1;
    });
    this.coins.forEach((c, i) => {
      c.userData.landed = false;
      c.position.copy(LAND[i]!);
      setCoinFace(c, faces[i]!);
      c.rotation.set(faces[i] ? -0.5 : Math.PI - 0.5, 0, (i - 1) * 0.12);
    });
  }

  async playRecall(): Promise<void> {
    const starts = this.coins.map((c) => c.position.clone());
    await this.runAnim((acc) => {
      const t = Math.min(1, acc / 0.7);
      const e = easeOutCubic(t);
      for (let i = 0; i < 3; i++) {
        this.coins[i]!.position.lerpVectors(starts[i]!, NEST[i]!, e);
      }
      return t >= 1;
    });
  }

  async playFinale(): Promise<void> {
    this.audio.playBell();
    const base = this.shell.scale.clone();
    await this.runAnim((acc) => {
      const t = Math.min(1, acc / 1.4);
      const pulse = 1 + Math.sin(t * Math.PI) * 0.05;
      this.shell.scale.setScalar(1.05 * pulse);
      return t >= 1;
    });
    this.shell.scale.copy(base);
  }

  hideCoins(): void {
    this.coins.forEach((c) => {
      c.visible = false;
    });
  }

  setReducedMotion(v: boolean): void {
    this.reduced = v;
  }

  dispose(): void {
    this.renderer.dispose();
    this.host.innerHTML = '';
  }
}
