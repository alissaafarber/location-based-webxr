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
    roughness: 0.7,
    metalness: 0.0,
  });

  // Smaller box geometry (reduced from 2*scale to 0.5*scale)
  const boxGeometry = new THREE.BoxGeometry(0.5 * scale, 0.5 * scale, 0.5 * scale);
  const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
  boxMesh.position.set(0, 0.25 * scale, 0); // Position so bottom touches ground at Y=0
  boxMesh.castShadow = true;
  boxMesh.receiveShadow = true;
  group.add(boxMesh);

  // Add a ground plane to receive shadows
  const groundGeometry = new THREE.PlaneGeometry(10 * scale, 10 * scale);
  const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.4 });
  const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
  groundMesh.rotation.x = -Math.PI / 2; // Rotate to be horizontal
  groundMesh.position.y = 0; // Ground level
  groundMesh.receiveShadow = true;
  groundMesh.castShadow = false; // Ground plane only receives shadows
  group.add(groundMesh);

  // Content bounds for shadow camera frustum (focused on the box)
  const bounds: ContentBounds = {
    center: {
      x: 0,
      y: 0.25 * scale,
      z: 0,
    },
    radius: 1.0 * scale, // Bounds around the box
  };

  return {
    mesh: group,
    bounds,
  };
}
