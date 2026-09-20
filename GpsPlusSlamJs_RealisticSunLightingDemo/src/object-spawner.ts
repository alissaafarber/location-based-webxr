import * as THREE from 'three';
import type { ContentBounds } from 'gps-plus-slam-app-framework/visualization/sun-shadow-rig';

export interface SpawnOptions {
  readonly scale?: number;
}

export interface SpawnedObject {
  readonly mesh: THREE.Group;
  readonly bounds: ContentBounds;
}

/**
 * Creates a high-fidelity 3D sundial model designed to showcase directional
 * sun shadows and physical contact shadowing on real-world surfaces.
 */
export function createSundialModel(options: SpawnOptions = {}): SpawnedObject {
  const scale = options.scale ?? 1.0;
  const group = new THREE.Group();
  group.name = 'sundial-showcase-model';

  // 1. Materials
  const stoneMaterial = new THREE.MeshStandardMaterial({
    color: 0x8a857e,
    roughness: 0.75,
    metalness: 0.05,
  });

  const bronzeMaterial = new THREE.MeshStandardMaterial({
    color: 0xd4a359,
    roughness: 0.3,
    metalness: 0.8,
  });

  const markerMaterial = new THREE.MeshStandardMaterial({
    color: 0x2c2621,
    roughness: 0.5,
    metalness: 0.5,
  });

  // 2. Base Pedestal (Layer 1: Octagonal/Cylindrical Step Base)
  const baseGeom = new THREE.CylinderGeometry(0.35 * scale, 0.42 * scale, 0.1 * scale, 16);
  const baseMesh = new THREE.Mesh(baseGeom, stoneMaterial);
  baseMesh.position.y = 0.05 * scale;
  baseMesh.castShadow = true;
  baseMesh.receiveShadow = true;
  group.add(baseMesh);

  // 3. Main Column / Plinth (Layer 2)
  const columnGeom = new THREE.CylinderGeometry(0.24 * scale, 0.28 * scale, 0.45 * scale, 16);
  const columnMesh = new THREE.Mesh(columnGeom, stoneMaterial);
  columnMesh.position.y = (0.1 + 0.225) * scale;
  columnMesh.castShadow = true;
  columnMesh.receiveShadow = true;
  group.add(columnMesh);

  // 4. Dial Table Top (Layer 3)
  const tableGeom = new THREE.CylinderGeometry(0.38 * scale, 0.35 * scale, 0.06 * scale, 24);
  const tableMesh = new THREE.Mesh(tableGeom, stoneMaterial);
  tableMesh.position.y = (0.1 + 0.45 + 0.03) * scale;
  tableMesh.castShadow = true;
  tableMesh.receiveShadow = true;
  group.add(tableMesh);

  // 5. Bronze Dial Face Plate
  const plateGeom = new THREE.CylinderGeometry(0.32 * scale, 0.32 * scale, 0.015 * scale, 32);
  const plateMesh = new THREE.Mesh(plateGeom, bronzeMaterial);
  plateMesh.position.y = (0.1 + 0.45 + 0.06 + 0.0075) * scale;
  plateMesh.castShadow = true;
  plateMesh.receiveShadow = true;
  group.add(plateMesh);

  // 6. Hour markers arranged radially
  const plateY = plateMesh.position.y + 0.008 * scale;
  const markerGeom = new THREE.BoxGeometry(0.015 * scale, 0.004 * scale, 0.05 * scale);
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const markerMesh = new THREE.Mesh(markerGeom, markerMaterial);
    const radius = 0.25 * scale;
    markerMesh.position.set(
      Math.sin(angle) * radius,
      plateY,
      Math.cos(angle) * radius
    );
    markerMesh.rotation.y = angle;
    markerMesh.castShadow = true;
    markerMesh.receiveShadow = true;
    group.add(markerMesh);
  }

  // 7. Gnomon (Stylized triangular wedge / rod casting sharp shadows)
  const gnomonShape = new THREE.Shape();
  gnomonShape.moveTo(0, 0);
  gnomonShape.lineTo(0.24 * scale, 0);
  gnomonShape.lineTo(0, 0.22 * scale);
  gnomonShape.closePath();

  const extrudeSettings = {
    depth: 0.012 * scale,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.002 * scale,
    bevelThickness: 0.002 * scale,
  };

  const gnomonGeom = new THREE.ExtrudeGeometry(gnomonShape, extrudeSettings);
  // Center the extrusion thickness along Z
  gnomonGeom.center();
  // Align bottom edge to Y=0 and root at X=0
  gnomonGeom.translate(0.08 * scale, 0.11 * scale, 0);

  const gnomonMesh = new THREE.Mesh(gnomonGeom, bronzeMaterial);
  gnomonMesh.position.set(0, plateY, 0);
  // Point gnomon towards North (positive X in NUE space)
  gnomonMesh.rotation.y = -Math.PI / 2;
  gnomonMesh.castShadow = true;
  gnomonMesh.receiveShadow = true;
  group.add(gnomonMesh);

  // 8. Calculate enclosing ContentBounds (Sphere3D)
  const totalHeight = (0.1 + 0.45 + 0.06 + 0.015 + 0.22) * scale;
  const bounds: ContentBounds = {
    center: {
      x: 0,
      y: (totalHeight / 2),
      z: 0,
    },
    radius: Math.max(0.45 * scale, totalHeight / 2 + 0.1 * scale),
  };

  return {
    mesh: group,
    bounds,
  };
}
