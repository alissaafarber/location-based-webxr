# `src/object-spawner.ts`

## Purpose

Creates a 3D digital sundial model with pedestal, dial face, hour markers, and an angled gnomon designed to demonstrate directional solar shadows and contact shadows on real-world AR surfaces.

## Public API

```ts
export interface SpawnOptions {
  readonly scale?: number;
}

export interface SpawnedObject {
  readonly mesh: THREE.Group;
  readonly bounds: ContentBounds;
}

export function createSundialModel(options?: SpawnOptions): SpawnedObject;
```

## Invariants

- All meshes in the returned group have `castShadow = true` and `receiveShadow = true`.
- The base geometry sits flush with the ground plane at $Y = 0$.
- Returns a bounding `ContentBounds` (Sphere3D) centered on the model for shadow camera frustum framing.

## Examples

```ts
import { createSundialModel } from './object-spawner.js';

const sundial = createSundialModel({ scale: 1.0 });
arWorldGroup.add(sundial.mesh);
```

## Tests

Covered by unit tests in `src/object-spawner.test.ts`.
