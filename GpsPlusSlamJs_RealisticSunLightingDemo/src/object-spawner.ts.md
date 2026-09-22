# `src/object-spawner.ts`

## Purpose

Creates a simple box for shadow debugging, matching the working pattern from SunShadowRigDemo. Replaces complex sundial to isolate ground shadow issues.

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

- Box has `castShadow = true` and `receiveShadow = true` for shadow casting and receiving.
- Box is positioned at Y=1*scale to sit above ground plane.
- Returns a bounding `ContentBounds` (Sphere3D) centered on the box for shadow camera frustum framing.

## Examples

```ts
import { createSundialModel } from './object-spawner.js';

const box = createSundialModel({ scale: 1.0 });
arWorldGroup.add(box.mesh);
```

## Tests

Covered by unit tests in `src/object-spawner.test.ts`.
