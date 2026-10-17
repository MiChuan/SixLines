import * as THREE from 'three';

/** 程序化开元通宝：扁圆 + 方孔 + 字面标记 */
export function createCoin(): THREE.Group {
  const g = new THREE.Group();

  const bronze = new THREE.MeshStandardMaterial({
    color: 0xb08d57,
    metalness: 0.85,
    roughness: 0.35,
  });
  const dark = new THREE.MeshStandardMaterial({
    color: 0x5c4030,
    metalness: 0.7,
    roughness: 0.45,
  });
  const gilt = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    metalness: 0.9,
    roughness: 0.25,
    emissive: 0x3a2a08,
    emissiveIntensity: 0.15,
  });

  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.04, 48), bronze);
  body.rotation.x = Math.PI / 2;
  g.add(body);

  const hole = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 0.05), dark);
  g.add(hole);

  // 字面标记条（示意「开元通宝」四字分区）
  const mark = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.012), gilt);
  mark.position.set(0, 0.12, 0.025);
  g.add(mark);
  const mark2 = mark.clone();
  mark2.position.set(0, -0.12, 0.025);
  g.add(mark2);
  const mark3 = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.12, 0.012), gilt);
  mark3.position.set(0.12, 0, 0.025);
  g.add(mark3);
  const mark4 = mark3.clone();
  mark4.position.set(-0.12, 0, 0.025);
  g.add(mark4);

  // 背面略深
  const back = new THREE.Mesh(new THREE.CircleGeometry(0.2, 32), dark);
  back.position.z = -0.022;
  g.add(back);

  g.userData.faceYang = true;
  return g;
}

/** yang=字面朝上（朝 +Z 相机侧） */
export function setCoinFace(coin: THREE.Group, yang: boolean): void {
  coin.userData.faceYang = yang;
  coin.rotation.x = yang ? 0 : Math.PI;
}
