import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { createSundialModel, type SpawnedObject } from './object-spawner.js';

describe('object-spawner', () => {
  it('creates a sundial model group with castShadow and receiveShadow enabled', () => {
    const spawned: SpawnedObject = createSundialModel();

    expect(spawned.mesh).toBeInstanceOf(THREE.Group);
    expect(spawned.mesh.children.length).toBeGreaterThan(0);

    let meshCount = 0;
    spawned.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        meshCount++;
        expect(child.castShadow).toBe(true);
        expect(child.receiveShadow).toBe(true);
        expect(child.material).toBeInstanceOf(THREE.MeshStandardMaterial);
      }
    });

    expect(meshCount).toBeGreaterThanOrEqual(3);
  });

  it('computes valid ContentBounds enclosing the object above ground Y=0', () => {
    const spawned = createSundialModel();

    expect(spawned.bounds).toBeDefined();
    if ('radius' in spawned.bounds) {
      expect(spawned.bounds.radius).toBeGreaterThan(0);
      expect(spawned.bounds.center.y).toBeGreaterThan(0);
    } else {
      expect(spawned.bounds.max.y).toBeGreaterThan(spawned.bounds.min.y);
      expect(spawned.bounds.min.y).toBeGreaterThanOrEqual(-0.01);
    }
  });

  it('supports custom scale factor', () => {
    const defaultObj = createSundialModel();
    const scaledObj = createSundialModel({ scale: 2.0 });

    if ('radius' in defaultObj.bounds && 'radius' in scaledObj.bounds) {
      expect(scaledObj.bounds.radius).toBeCloseTo(defaultObj.bounds.radius * 2.0, 1);
    }
  });
});
