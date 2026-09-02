/**
 * Altitude-driven lighting model.
 *
 * Maps the sun's altitude angle (radians, as returned by SunCalc.getPosition)
 * to intensity, colour, and ambient level values suitable for a Three.js scene.
 *
 * @see sun-altitude-lighting.ts.md for the full specification.
 */

/** RGB colour of the direct sunlight as a hex integer (0xRRGGBB). */
export type LightColor = number;

/** Lighting outputs derived from a single sun altitude sample. */
export interface SunLightingResult {
  /**
   * Direct-light intensity in the range [0, 1].
   * 0 = no direct light (night / below horizon);
   * 1 = full midday intensity.
   */
  readonly intensity: number;

  /**
   * Colour of the direct light as a 24-bit hex integer (for Three.js Color /
   * MeshStandardMaterial emissive).
   * Warm orange near the horizon, white at zenith, deep blue-violet during
   * astronomical twilight.
   */
  readonly color: LightColor;

  /**
   * Ambient (sky) light level in the range [0, 1].
   * Always >= intensity (sky is never darker than direct sun).
   * Represents scattered/diffuse skylight and stays elevated during civil
   * twilight even when the sun is below the horizon.
   */
  readonly ambientLevel: number;
}

/**
 * Derive a lighting model from a sun altitude angle.
 *
 * @param altitudeRad - Sun altitude in radians [-π/2, π/2].
 *   Negative values indicate the sun is below the horizon.
 *   Obtained from SunCalc.getPosition(date, lat, lng).altitude.
 * @returns SunLightingResult with intensity, color, and ambientLevel.
 */
export function sunAltitudeToLighting(_altitudeRad: number): SunLightingResult {
  // Stub — returns a fixed zero value so that tests fail on incorrect data,
  // not on an uncaught exception. Replace with the real implementation.
  return { intensity: 0, color: 0x000000, ambientLevel: 0 };
}
