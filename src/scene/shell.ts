import * as THREE from 'three';

/** 程序化龟甲：椭圆壳体 + 裂纹线 */
export function createTurtleShell(): THREE.Group {
  const root = new THREE.Group();

  const shellMat = new THREE.MeshStandardMaterial({
    color: 0x3d2b1f,
    metalness: 0.25,
    roughness: 0.55,
    emissive: 0x1a1208,
    emissiveIntensity: 0.2,
  });
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0xc9a227,
    metalness: 0.8,
    roughness: 0.3,
    emissive: 0x4a3508,
    emissiveIntensity: 0.25,
  });
  const crackMat = new THREE.LineBasicMaterial({ color: 0x8b7355, transparent: true, opacity: 0.7 });

  const outer = new THREE.Mesh(new THREE.SphereGeometry(1.15, 48, 32, 0, Math.PI * 2, 0, Math.PI * 0.55), shellMat);
  outer.scale.set(1.15, 0.55, 1.35);
  outer.position.y = 0.15;
  root.add(outer);

  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.06, 12, 64), rimMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.05;
  rim.scale.set(1.15, 1.35, 1);
  root.add(rim);

  // 腹甲浅盘（装币处）
  const bowl = new THREE.Mesh(
    new THREE.SphereGeometry(0.85, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.45),
    new THREE.MeshStandardMaterial({
      color: 0x2a1c12,
      metalness: 0.2,
      roughness: 0.7,
      side: THREE.BackSide,
    }),
  );
  bowl.scale.set(1, 0.35, 1.15);
  bowl.position.y = 0.35;
  root.add(bowl);

  // 背甲分区裂纹
  const crackGroup = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const pts = [];
    for (let j = 0; j <= 8; j++) {
      const a = (j / 8) * Math.PI - Math.PI / 2;
      const r = 0.35 + i * 0.12;
      pts.push(new THREE.Vector3(Math.sin(a) * r * 1.1, 0.4 + Math.cos(a * 0.5) * 0.15, Math.cos(a) * r * 1.2));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    crackGroup.add(new THREE.Line(geo, crackMat));
  }
  // 纵向
  for (let i = -2; i <= 2; i++) {
    const pts = [
      new THREE.Vector3(i * 0.22, 0.55, -0.9),
      new THREE.Vector3(i * 0.18, 0.75, 0),
      new THREE.Vector3(i * 0.22, 0.5, 0.9),
    ];
    crackGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), crackMat));
  }
  root.add(crackGroup);

  root.userData.breath = 0;
  return root;
}
