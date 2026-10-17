import * as THREE from 'three';

function hexShape(r: number): THREE.Shape {
  const s = new THREE.Shape();
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 6) + (i * Math.PI) / 3;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) s.moveTo(x, y);
    else s.lineTo(x, y);
  }
  s.closePath();
  return s;
}

function makeScute(r: number, mat: THREE.Material): THREE.Mesh {
  const geo = new THREE.ExtrudeGeometry(hexShape(r), {
    depth: 0.045,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.01,
    bevelSegments: 2,
  });
  geo.center();
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true;
  return m;
}

/** 程序化龟甲：六角盾片背甲 + 头尾轮廓 + 中央凹窝盛币 */
export function createTurtleShell(): THREE.Group {
  const root = new THREE.Group();

  const plateMat = new THREE.MeshStandardMaterial({
    color: 0x5a4030,
    metalness: 0.35,
    roughness: 0.48,
    emissive: 0x2a1a0c,
    emissiveIntensity: 0.18,
  });
  const plateDark = new THREE.MeshStandardMaterial({
    color: 0x3a281c,
    metalness: 0.3,
    roughness: 0.55,
    emissive: 0x1a1008,
    emissiveIntensity: 0.12,
  });
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0xc9a227,
    metalness: 0.85,
    roughness: 0.28,
    emissive: 0x4a3508,
    emissiveIntensity: 0.3,
  });
  const fleshMat = new THREE.MeshStandardMaterial({
    color: 0x6b5344,
    metalness: 0.15,
    roughness: 0.7,
  });

  // 穹顶底壳（深色）
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(1.05, 40, 28, 0, Math.PI * 2, 0, Math.PI * 0.52),
    plateDark,
  );
  dome.scale.set(1.05, 0.62, 1.35);
  dome.position.y = 0.05;
  root.add(dome);

  // 六角盾片阵列（脊椎列 + 肋板）— 一眼可辨龟背
  const scuteRoot = new THREE.Group();
  scuteRoot.position.y = 0.28;

  const layout: { x: number; z: number; r: number; dark?: boolean }[] = [
    // 中脊 5 片
    { x: 0, z: -0.72, r: 0.2 },
    { x: 0, z: -0.36, r: 0.22 },
    { x: 0, z: 0, r: 0.24 },
    { x: 0, z: 0.36, r: 0.22 },
    { x: 0, z: 0.72, r: 0.2 },
    // 左肋
    { x: -0.38, z: -0.55, r: 0.19, dark: true },
    { x: -0.42, z: -0.18, r: 0.2, dark: true },
    { x: -0.42, z: 0.18, r: 0.2, dark: true },
    { x: -0.38, z: 0.55, r: 0.19, dark: true },
    // 右肋
    { x: 0.38, z: -0.55, r: 0.19, dark: true },
    { x: 0.42, z: -0.18, r: 0.2, dark: true },
    { x: 0.42, z: 0.18, r: 0.2, dark: true },
    { x: 0.38, z: 0.55, r: 0.19, dark: true },
  ];

  for (const p of layout) {
    const scute = makeScute(p.r, p.dark ? plateDark : plateMat);
    // 贴合椭圆穹面
    const nx = p.x / 1.05;
    const nz = p.z / 1.35;
    const h = Math.sqrt(Math.max(0, 1 - nx * nx - nz * nz)) * 0.55;
    scute.position.set(p.x, h, p.z);
    scute.lookAt(p.x * 1.4, h + 1.2, p.z * 1.4);
    scute.rotateX(Math.PI / 2);
    scuteRoot.add(scute);

    // 鎏金描边环
    const edge = new THREE.Mesh(
      new THREE.TorusGeometry(p.r * 0.92, 0.012, 6, 6),
      rimMat,
    );
    edge.position.copy(scute.position);
    edge.position.y += 0.03;
    edge.rotation.x = Math.PI / 2;
    scuteRoot.add(edge);
  }
  root.add(scuteRoot);

  // 缘盾（一圈小六边形）
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const rx = Math.cos(a) * 0.95;
    const rz = Math.sin(a) * 1.2;
    const m = makeScute(0.11, plateMat);
    m.position.set(rx, 0.12, rz);
    m.rotation.x = -0.5;
    m.rotation.z = a;
    m.scale.set(1, 1, 0.7);
    root.add(m);
  }

  // 金边外环
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.08, 0.055, 10, 64), rimMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.02;
  rim.scale.set(1.0, 1.28, 1);
  root.add(rim);

  // 中央凹窝（盛币）— 挖空感用深色碗
  const bowl = new THREE.Mesh(
    new THREE.SphereGeometry(0.55, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.5),
    new THREE.MeshStandardMaterial({
      color: 0x1a120c,
      metalness: 0.25,
      roughness: 0.65,
      side: THREE.BackSide,
    }),
  );
  bowl.scale.set(1.15, 0.45, 1.0);
  bowl.position.set(0, 0.55, 0);
  root.add(bowl);

  const bowlRim = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.03, 8, 40), rimMat);
  bowlRim.rotation.x = Math.PI / 2;
  bowlRim.position.set(0, 0.58, 0);
  root.add(bowlRim);

  // 头（前端）— 剪影可辨
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), fleshMat);
  head.scale.set(0.85, 0.7, 1.35);
  head.position.set(0, 0.08, 1.55);
  root.add(head);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.35, 12), fleshMat);
  neck.rotation.x = Math.PI / 2;
  neck.position.set(0, 0.06, 1.28);
  root.add(neck);

  // 尾
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.35, 8), fleshMat);
  tail.rotation.x = Math.PI / 2;
  tail.position.set(0, 0.05, -1.5);
  root.add(tail);

  // 四肢短 stub
  for (const [x, z] of [
    [-0.85, 0.85],
    [0.85, 0.85],
    [-0.85, -0.85],
    [0.85, -0.85],
  ] as const) {
    const leg = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), fleshMat);
    leg.scale.set(1, 0.55, 1.2);
    leg.position.set(x, -0.08, z);
    root.add(leg);
  }

  root.rotation.x = -0.35; // 略仰，盾片朝向镜头
  return root;
}
