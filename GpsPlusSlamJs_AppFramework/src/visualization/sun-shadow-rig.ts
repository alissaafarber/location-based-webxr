/**
 * Sun-driven shadow rig for location-based WebXR and desktop replay.
 * Skeleton implementation for TDD.
 *
 * @see sun-shadow-rig.ts.md
 */

import * as THREE from 'three';
import type { NueDirection } from '../geo/sun-position.js';
import type { SunLightingResult } from '../geo/sun-altitude-lighting.js';

/** Axis-aligned 3D bounding box for shadow framing. */
export interface Aabb3D {
  readonly min: { readonly x: number; readonly y: number; readonly z: number };
  readonly max: { readonly x: number; readonly y: number; readonly z: number };
}

/** 3D bounding sphere for radial shadow framing. */
export interface Sphere3D {
  readonly center: {
    readonly x: number;
    readonly y: number;
    readonly z: number;
  };
  readonly radius: number;
}

/** Content volume passed to frame the shadow camera. */
export type ContentBounds = Aabb3D | Sphere3D;

/** Orthographic camera frustum extents in light view space. */
export interface ShadowFrustum {
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
  readonly near: number;
  readonly far: number;
}

/** World-space positioning for a directional light shining at a target. */
export interface SunLightPlacement {
  readonly position: {
    readonly x: number;
    readonly y: number;
    readonly z: number;
  };
  readonly target: {
    readonly x: number;
    readonly y: number;
    readonly z: number;
  };
}

/** Configuration options for the Sun-driven shadow rig. */
export interface SunShadowRigOptions {
  readonly targetOrigin?: {
    readonly x: number;
    readonly y: number;
    readonly z: number;
  };
  readonly distance?: number;
  readonly mapSize?: number;
  readonly bias?: number;
  readonly normalBias?: number;
  readonly groundPlaneSize?: number;
  readonly shadowOpacity?: number;
  readonly shadowColor?: THREE.ColorRepresentation;
  readonly margin?: number;
  readonly defaultContentExtent?: number;
}

/** Lifecycle and update handle for the Sun-driven shadow rig. */
export interface SunShadowRig {
  readonly directionalLight: THREE.DirectionalLight;
  readonly shadowCatcher: THREE.Mesh<THREE.PlaneGeometry, THREE.ShadowMaterial>;
  readonly target: THREE.Object3D;

  update(
    directionNue: NueDirection,
    contentBounds?: ContentBounds,
    lighting?: SunLightingResult
  ): void;

  setVisible(visible: boolean): void;

  dispose(): void;
}

/** Module defaults pinned across instances. */
export const DEFAULT_SUN_SHADOW_RIG: Readonly<{
  distance: number;
  mapSize: number;
  bias: number;
  normalBias: number;
  groundPlaneSize: number;
  shadowOpacity: number;
  shadowColor: number;
  margin: number;
  defaultContentExtent: number;
  targetOrigin: { readonly x: number; readonly y: number; readonly z: number };
}> = Object.freeze({
  distance: 0,
  mapSize: 0,
  bias: 0,
  normalBias: 0,
  groundPlaneSize: 0,
  shadowOpacity: 0,
  shadowColor: 0,
  margin: 0,
  defaultContentExtent: 0,
  targetOrigin: Object.freeze({ x: 0, y: 0, z: 0 }),
});

/**
 * Pure calculation: compute directional light world position shining towards a target.
 */
export function computeLightPlacement(
  _targetOrigin: { readonly x: number; readonly y: number; readonly z: number },
  _directionNue: NueDirection,
  _distance: number
): SunLightPlacement {
  return {
    position: { x: 0, y: 0, z: 0 },
    target: { x: 0, y: 0, z: 0 },
  };
}

/** Configuration options for orthographic shadow frustum calculation. */
export interface ShadowFrustumOptions {
  readonly distance?: number;
  readonly targetOrigin?: {
    readonly x: number;
    readonly y: number;
    readonly z: number;
  };
  readonly margin?: number;
}

/**
 * Pure calculation: compute tight orthographic frustum extents for a directional light
 * enclosing the specified content volume.
 */
export function computeShadowFrustum(
  _contentBounds: ContentBounds,
  _directionNue: NueDirection,
  _options?: number | ShadowFrustumOptions
): ShadowFrustum {
  return {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    near: 0,
    far: 0,
  };
}

/**
 * Factory creating the complete Sun-driven shadow rig attached to a scene.
 */
export function createSunShadowRig(
  _parent: THREE.Object3D,
  _options?: SunShadowRigOptions
): SunShadowRig {
  const directionalLight = new THREE.DirectionalLight();
  const shadowCatcher = new THREE.Mesh() as unknown as THREE.Mesh<
    THREE.PlaneGeometry,
    THREE.ShadowMaterial
  >;
  const target = new THREE.Object3D();

  return {
    directionalLight,
    shadowCatcher,
    target,
    update: (
      _directionNue: NueDirection,
      _contentBounds?: ContentBounds,
      _lighting?: SunLightingResult
    ) => {},
    setVisible: (_visible: boolean) => {},
    dispose: () => {},
  };
}
