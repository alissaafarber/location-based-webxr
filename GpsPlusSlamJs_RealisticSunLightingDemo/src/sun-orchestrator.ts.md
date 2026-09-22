# `src/sun-orchestrator.ts`

## Purpose

Orchestrates the solar rendering pipeline: subscribes to the `RealSunDataAdapter`, translates solar altitude to physical lighting parameters with `sunAltitudeToLighting`, updates the scene's ambient light, and drives both the `SunShadowRig` and `VisibleSunDisc`.

## Public API

```ts
export interface SunOrchestratorDependencies {
  readonly scene: THREE.Scene;
  readonly arWorldGroup: THREE.Group;
}

export interface SunOrchestrator {
  readonly adapter: RealSunDataAdapter;
  readonly shadowRig: SunShadowRig;
  readonly sunDisc: VisibleSunDisc;
  readonly ambientLight: THREE.AmbientLight;

  updateFrame(camera: THREE.Camera, contentBounds?: ContentBounds): void;
  dispose(): void;
}

export function createSunOrchestrator(
  deps: SunOrchestratorDependencies
): SunOrchestrator;
```

## Invariants

- Subscribes to solar state changes and propagates updates immediately to the shadow rig and ambient light.
- `updateFrame` always updates the shadow rig with current lighting and content bounds (even when bounds are undefined, uses default bounds).
- Content bounds must be in NUE coordinates (same as arWorldGroup local space) to match shadow rig's GPS-world NUE space.
- Shadow rig uses high-resolution shadow map (4096px), increased opacity (0.8), and fine-tuned bias parameters for optimal self-shadowing and ground shadows.
- `dispose` unhooks subscriptions, disposes child resources, and removes ambient light from the scene.

## Examples

```ts
const orchestrator = createSunOrchestrator({ scene, arWorldGroup });

// In frame loop:
orchestrator.updateFrame(camera, placedBounds);
```

## Tests

Covered by unit tests in `src/sun-orchestrator.test.ts`.
