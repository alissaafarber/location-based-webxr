# `src/object-spawner.ts`

## Purpose

Creates a simple box geometry for shadow debugging. This is a simpler geometry alternative to complex models.

## Public API

```ts
export interface SpawnOptions {
  readonly scale?: number;
}

export interface SpawnedObject {
  readonly mesh: THREE.Group;
  readonly bounds: ContentBounds;
}

export function createSimpleGeometry(options?: SpawnOptions): SpawnedObject;
```

## Invariants

- Box has `castShadow = true` and `receiveShadow = true` for shadow casting and receiving.
- Box is positioned at Y=0.25*scale (bottom touches ground at Y=0).
- Ground plane with ShadowMaterial receives shadows at Y=0.
- Returns a bounding `ContentBounds` (Sphere3D) centered on the box for shadow camera frustum framing.

## Examples

```ts
import { createSimpleGeometry } from './object-spawner.js';

const box = createSimpleGeometry({ scale: 1.0 });
arWorldGroup.add(box.mesh);
```

## Tests

Covered by unit tests in `src/object-spawner.test.ts`.
