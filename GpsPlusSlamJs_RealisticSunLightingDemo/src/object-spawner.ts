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
 * Creates a simple box for shadow debugging (replaces complex sundial).
 * This matches the working pattern from SunShadowRigDemo.
 */
export function createSundialModel(options: SpawnOptions = {}): SpawnedObject {
  const scale = options.scale ?? 1.0;
  const group = new THREE.Group();
  group.name = 'shadow-debug-box';

  // Simple box material (matches working demo)
  const boxMaterial = new THREE.MeshStandardMaterial({
    color: 0xff6b6b,
    roughness: 0.5,
    metalness: 0.1,
  });

  // Simple box geometry (matches working demo)
  const boxGeometry = new THREE.BoxGeometry(2 * scale, 2 * scale, 2 * scale);
  const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
  boxMesh.position.set(0, 1 * scale, 0); // Position above ground
  boxMesh.castShadow = true;
  boxMesh.receiveShadow = true;
  group.add(boxMesh);

  // Simple content bounds
  const bounds: ContentBounds = {
    center: {
      x: 0,
      y: 1 * scale,
      z: 0,
    },
    radius: 1.5 * scale,
  };

  return {
    mesh: group,
    bounds,
  };
}
