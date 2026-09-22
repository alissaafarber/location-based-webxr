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
 * Creates a simple box geometry for shadow debugging.
 * This is a simpler geometry alternative to complex models.
 */
export function createSimpleGeometry(options: SpawnOptions = {}): SpawnedObject {
  const scale = options.scale ?? 1.0;
  const group = new THREE.Group();
  group.name = 'simple-geometry-box';

  // Simple box material with proper lighting properties
  const boxMaterial = new THREE.MeshStandardMaterial({
    color: 0xff6b6b,
    roughness: 0.5,
    metalness: 0.1,
  });

  // Simple box geometry
  const boxGeometry = new THREE.BoxGeometry(2 * scale, 2 * scale, 2 * scale);
  const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
  boxMesh.position.set(0, 1 * scale, 0);
  boxMesh.castShadow = true;
  boxMesh.receiveShadow = true;
  group.add(boxMesh);

  // Content bounds for shadow camera frustum
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
