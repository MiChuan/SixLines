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
    host.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(42, host.clientWidth / host.clientHeight, 0.1, 100);
    this.camera.position.set(0, 2.2, 4.2);
    this.camera.lookAt(0, 0.3, 0);

    this.scene.fog = new THREE.FogExp2(0x0a0806, 0.045);
    this.scene.add(new THREE.AmbientLight(0x6a5a40, 0.55));
    const key = new THREE.PointLight(0xffc978, 2.2, 20);
    key.position.set(2, 4, 3);
    this.scene.add(key);
    const fill = new THREE.PointLight(0x446688, 0.6, 15);
    fill.position.set(-3, 1, -2);
    this.scene.add(fill);

    // 地面微光
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(3.5, 64),
      new THREE.MeshStandardMaterial({ color: 0x12100c, metalness: 0.2, roughness: 0.9 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.35;
    this.scene.add(ground);

    this.shell = createTurtleShell();
    this.scene.add(this.shell);

    for (let i = 0; i < 3; i++) {
      const c = createCoin();
      c.visible = false;
      this.coins.push(c);
      this.scene.add(c);
    }

    window.addEventListener('resize', () => this.onResize());
    this.loop();
  }

  private onResize(): void {
    const w = this.host.clientWidth;
    const h = this.host.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  private loop = (): void => {
    requestAnimationFrame(this.loop);
    const dt = this.clock.getDelta();
    const t = this.clock.elapsedTime;
    if (!this.reduced) {
      this.shell.position.y = Math.sin(t * 0.8) * 0.03;
      this.shell.rotation.y = Math.sin(t * 0.25) * 0.04;
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
    const targets = [
      new THREE.Vector3(-0.25, 0.45, 0.1),
      new THREE.Vector3(0.05, 0.42, -0.15),
      new THREE.Vector3(0.28, 0.48, 0.05),
    ];
    this.coins.forEach((c, i) => {
      c.visible = true;
      c.position.set((i - 1) * 0.6, 2.5, 0.5);
      c.rotation.set(0, 0, 0);
      setCoinFace(c, true);
    });

    await this.runAnim((acc) => {
      const total = 1.25;
      for (let i = 0; i < 3; i++) {
        const local = Math.max(0, Math.min(1, (acc - i * 0.15) / 0.7));
        const e = easeOutCubic(local);
        const start = new THREE.Vector3((i - 1) * 0.6, 2.5, 0.5);
        const p = start.clone().lerp(targets[i]!, e);
        p.y += Math.sin(e * Math.PI) * 0.4;
        this.coins[i]!.position.copy(p);
        this.coins[i]!.rotation.z = e * Math.PI * 2;
        if (local > 0.95 && !(this.coins[i]!.userData.dropped)) {
          this.coins[i]!.userData.dropped = true;
          this.audio.playCoinDrop(i);
        }
      }
      return acc >= total;
    });
    this.coins.forEach((c) => {
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
        this.shell.rotation.z = baseRot.z + Math.sin(acc * 28) * 0.18 * damp;
        this.shell.rotation.x = baseRot.x + Math.cos(acc * 22) * 0.08 * damp;
        this.coins.forEach((c, i) => {
          c.position.x += Math.sin(acc * 30 + i) * 0.002;
          c.rotation.z += 0.2;
        });
        return false;
      }
      return true;
    });
    this.shell.rotation.copy(baseRot);

    // 飞出
    const land = [
      new THREE.Vector3(-0.9, -0.2, 1.4),
      new THREE.Vector3(0.05, -0.2, 1.7),
      new THREE.Vector3(0.95, -0.2, 1.35),
    ];
    const starts = this.coins.map((c) => c.position.clone());
    await this.runAnim((acc) => {
      const dur = 1.4;
      const t = Math.min(1, acc / dur);
      for (let i = 0; i < 3; i++) {
        const e = easeOutCubic(Math.max(0, (t - i * 0.05) / 0.85));
        const s = starts[i]!;
        const d = land[i]!;
        const y = lerp(s.y, d.y, e) + Math.sin(e * Math.PI) * 1.1;
        this.coins[i]!.position.set(lerp(s.x, d.x, e), y, lerp(s.z, d.z, e));
        this.coins[i]!.rotation.x = e * Math.PI * (faces[i] ? 2 : 3);
        this.coins[i]!.rotation.y = e * Math.PI * 1.5;
        if (e > 0.92 && !this.coins[i]!.userData.landed) {
          this.coins[i]!.userData.landed = true;
          setCoinFace(this.coins[i]!, faces[i]!);
          this.coins[i]!.rotation.set(faces[i] ? 0 : Math.PI, 0, 0);
          this.audio.playLand(i);
        }
      }
      return t >= 1;
    });
    this.coins.forEach((c, i) => {
      c.userData.landed = false;
      setCoinFace(c, faces[i]!);
      c.rotation.set(faces[i] ? 0 : Math.PI, 0, (i - 1) * 0.15);
    });
  }

  async playRecall(): Promise<void> {
    const targets = [
      new THREE.Vector3(-0.25, 0.45, 0.1),
      new THREE.Vector3(0.05, 0.42, -0.15),
      new THREE.Vector3(0.28, 0.48, 0.05),
    ];
    const starts = this.coins.map((c) => c.position.clone());
    await this.runAnim((acc) => {
      const t = Math.min(1, acc / 0.7);
      const e = easeOutCubic(t);
      for (let i = 0; i < 3; i++) {
        this.coins[i]!.position.lerpVectors(starts[i]!, targets[i]!, e);
      }
      return t >= 1;
    });
  }

  async playFinale(): Promise<void> {
    this.audio.playBell();
    const base = this.shell.scale.clone();
    await this.runAnim((acc) => {
      const t = Math.min(1, acc / 1.4);
      const pulse = 1 + Math.sin(t * Math.PI) * 0.06;
      this.shell.scale.setScalar(pulse);
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
