/**
 * Realistic Sun Lighting & Shading WebXR AR Demo
 *
 * Integrates Real Sun Data Adapter, Sun Position, Visible Sun Disc,
 * Sun Altitude Lighting, and Sun Shadow Rig from gps-plus-slam-app-framework.
 */
import * as THREE from 'three';
import {
  createEnableGpsArController,
  getArWorldGroup,
  getCamera,
  getCurrentArPose,
  getRenderer,
  getScene,
  registerXrFrameUpdate,
  startHitTestReticle,
  type EnableGpsArState,
  type HitTestReticleHandle,
} from 'gps-plus-slam-app-framework/ar';
import {
  createGpsPositionHandler,
  createSlamAppStore,
  selectAlignmentMatrix,
  selectZeroReference,
  startSession,
  teardownArSessionState,
  updateDeviceOrientation,
  type SubscribableStore,
} from 'gps-plus-slam-app-framework/state';
import { NullStorageBackend } from 'gps-plus-slam-app-framework/storage';
import type {
  GpsPosition,
  RawDeviceOrientation,
} from 'gps-plus-slam-app-framework/sensors';
import {
  createGpsAnchor,
  enableArWorldGroupAlignment,
  type GpsAnchor,
} from 'gps-plus-slam-app-framework/visualization';
import type { ContentBounds } from 'gps-plus-slam-app-framework/visualization/sun-shadow-rig';
import type { LatLong, LatLongAlt } from 'gps-plus-slam-app-framework/core';

import { createSundialModel } from './object-spawner.js';
import {
  createSunOrchestrator,
  type SunOrchestrator,
} from './sun-orchestrator.js';
import {
  createStatusPanelViewModel,
  formatTimeMinutes,
  TIME_PRESETS,
  type StatusPanelViewModel,
} from './status-panel.js';

function getElement<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error(`Missing #${id} in index.html`);
  }
  return el as T;
}

function buttonView(state: EnableGpsArState): { label: string; disabled: boolean } {
  switch (state.status) {
    case 'checking':
      return { label: 'Checking AR support…', disabled: true };
    case 'unsupported':
      return { label: 'AR not supported on this device', disabled: true };
    case 'ready':
      return { label: 'Enable GPS AR', disabled: false };
    case 'starting':
      return { label: 'Starting…', disabled: true };
    case 'running':
      return { label: 'AR Running', disabled: true };
    case 'stopping':
      return { label: 'Stopping…', disabled: true };
    case 'error':
      return { label: `Retry — ${state.error ?? 'failed to start'}`, disabled: false };
  }
}

function toGpsSeed(position: GpsPosition): LatLong | LatLongAlt {
  return typeof position.altitude === 'number'
    ? { lat: position.lat, lon: position.lon, altitude: position.altitude }
    : { lat: position.lat, lon: position.lon };
}

function main(): void {
  const arRoot = getElement<HTMLDivElement>('ar-root');
  const statusPanel = getElement<HTMLDivElement>('status-panel');
  const phaseBadge = getElement<HTMLSpanElement>('phase-badge');
  const valAzimuth = getElement<HTMLSpanElement>('val-azimuth');
  const valAltitude = getElement<HTMLSpanElement>('val-altitude');
  const valCoords = getElement<HTMLSpanElement>('val-coords');
  const valFixes = getElement<HTMLSpanElement>('val-fixes');
  const tabLive = getElement<HTMLButtonElement>('tab-live');
  const tabSim = getElement<HTMLButtonElement>('tab-sim');
  const simSection = getElement<HTMLDivElement>('sim-section');
  const timeSlider = getElement<HTMLInputElement>('time-slider');
  const timeDisplay = getElement<HTMLSpanElement>('time-display');
  const locationSelect = getElement<HTMLSelectElement>('location-select');
  const tapHint = getElement<HTMLDivElement>('tap-hint');
  const enterArBtn = getElement<HTMLButtonElement>('enter-ar');

  // Prevent taps inside the HUD panel from propagating to the WebXR hit test
  for (const eventName of ['pointerdown', 'touchstart', 'click'] as const) {
    statusPanel.addEventListener(eventName, (e) => e.stopPropagation());
  }

  // 1. Initialize State Store
  const store = createSlamAppStore({ storageBackend: new NullStorageBackend() });
  let gpsFixCount = 0;
  let lastGps: LatLong | LatLongAlt | null = null;
  let orchestrator: SunOrchestrator | null = null;
  let viewModel: StatusPanelViewModel | null = null;
  let reticleHandle: HitTestReticleHandle | null = null;
  let placedAnchor: GpsAnchor | null = null;
  let placedMesh: THREE.Group | null = null;
  let placedBounds: ContentBounds | undefined = undefined;

  const gpsHandler = createGpsPositionHandler({
    store,
    getArPose: getCurrentArPose,
  });

  // 2. HUD & Simulation Controls Setup
  function bindViewModel(vm: StatusPanelViewModel): void {
    tabLive.addEventListener('click', () => {
      tabLive.classList.add('active');
      tabSim.classList.remove('active');
      simSection.classList.add('hidden');
      vm.setLiveTime();
    });

    tabSim.addEventListener('click', () => {
      tabSim.classList.add('active');
      tabLive.classList.remove('active');
      simSection.classList.remove('hidden');
      vm.setTimeMinutes(Number(timeSlider.value));
      timeDisplay.textContent = formatTimeMinutes(Number(timeSlider.value));
    });

    timeSlider.addEventListener('input', () => {
      const mins = Number(timeSlider.value);
      timeDisplay.textContent = formatTimeMinutes(mins);
      vm.setTimeMinutes(mins);
    });

    const presetButtons = statusPanel.querySelectorAll<HTMLButtonElement>('.preset-btn');
    presetButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const timeKey = btn.dataset.time;
        const preset = TIME_PRESETS.find((p) => p.id === timeKey);
        if (preset) {
          timeSlider.value = preset.minutes.toString();
          timeDisplay.textContent = formatTimeMinutes(preset.minutes);
          vm.setTimeMinutes(preset.minutes);
        }
      });
    });

    locationSelect.addEventListener('change', () => {
      const val = locationSelect.value;
      if (val === 'live') {
        vm.setLiveLocation();
      } else {
        vm.selectLocationPreset(val);
      }
    });
  }

  function updateHud(): void {
    if (!viewModel) return;
    const summary = viewModel.getStatusSummary(gpsFixCount);

    phaseBadge.textContent = summary.phase;
    valCoords.textContent = summary.coordinatesText;
    valFixes.textContent = summary.gpsFixes.toString();

    if (summary.azimuthDeg !== undefined && summary.altitudeDeg !== undefined) {
      valAzimuth.textContent = `${summary.azimuthDeg.toFixed(1)}°`;
      valAltitude.textContent = `${summary.altitudeDeg.toFixed(1)}°`;
    } else {
      valAzimuth.textContent = '--°';
      valAltitude.textContent = '--°';
    }
  }

  // 3. Digital Object Tap-to-Place
  function placeSundial(worldPosition: THREE.Vector3): void {
    const scene = getScene();
    const arWorldGroup = getArWorldGroup();
    const camera = getCamera();
    if (!scene || !arWorldGroup || !camera) return;

    if (placedAnchor) {
      placedAnchor.dispose();
      placedAnchor = null;
    }
    if (placedMesh) {
      placedMesh.removeFromParent();
      placedMesh = null;
    }

    const sundial = createSundialModel({ scale: 1.0 });
    sundial.mesh.position.copy(worldPosition);
    placedMesh = sundial.mesh;

    if (lastGps) {
      placedAnchor = createGpsAnchor({
        object3D: sundial.mesh,
        arWorldGroup,
        camera,
        gpsPoint: lastGps,
        getAlignmentMatrix: () => selectAlignmentMatrix(store.getState()),
        getGpsZeroRef: (): LatLong | null => selectZeroReference(store.getState()),
      });
    } else {
      arWorldGroup.add(sundial.mesh);
    }

    // Register content bounds in world space for shadow rig framing
    placedBounds = {
      center: {
        x: worldPosition.x + ('center' in sundial.bounds ? sundial.bounds.center.x : 0),
        y: worldPosition.y + ('center' in sundial.bounds ? sundial.bounds.center.y : 0.4),
        z: worldPosition.z + ('center' in sundial.bounds ? sundial.bounds.center.z : 0),
      },
      radius: 'radius' in sundial.bounds ? sundial.bounds.radius : 1.0,
    };

    tapHint.classList.add('hidden');
  }

  // 4. AR Session Lifecycle Controller
  const controller = createEnableGpsArController();

  controller.subscribe((state: EnableGpsArState) => {
    const view = buttonView(state);
    enterArBtn.textContent = view.label;
    enterArBtn.disabled = view.disabled;

    if (state.status === 'running') {
      store.dispatch(
        startSession({
          scenarioName: 'sun-lighting-demo',
          sessionName: 'live',
          startTime: Date.now(),
        })
      );

      const scene = getScene();
      const arWorldGroup = getArWorldGroup();
      const camera = getCamera();
      const renderer = getRenderer();

      if (renderer) {
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      }

      if (scene && arWorldGroup) {
        enableArWorldGroupAlignment({
          store: store as unknown as SubscribableStore,
          arWorldGroup,
        });

        orchestrator = createSunOrchestrator({ scene, arWorldGroup });
        viewModel = createStatusPanelViewModel(orchestrator.adapter);
        bindViewModel(viewModel);

        tapHint.classList.remove('hidden');

        reticleHandle?.dispose();
        reticleHandle = startHitTestReticle({
          arWorldGroup,
          onSelect: (worldPosition) => {
            if (worldPosition) {
              placeSundial(worldPosition);
            }
          },
        });

        registerXrFrameUpdate(() => {
          if (orchestrator && camera) {
            orchestrator.updateFrame(camera, placedBounds);
          }
          updateHud();
        });
      }
    }
  });

  enterArBtn.addEventListener('click', () => {
    void controller.enable({
      container: arRoot,
      requestHitTest: true,
      isolationOptions: {
        enableCameraAccess: false,
        enableDepthSensingFeature: false,
        enableCameraTextureAcquisition: false,
      },
      callbacks: {
        onSessionEnd: () => {
          reticleHandle?.dispose();
          reticleHandle = null;
          if (placedAnchor) {
            placedAnchor.dispose();
            placedAnchor = null;
          }
          if (placedMesh) {
            placedMesh.removeFromParent();
            placedMesh = null;
          }
          placedBounds = undefined;
          orchestrator?.dispose();
          orchestrator = null;
          viewModel = null;
          teardownArSessionState(store);
          tapHint.classList.add('hidden');
        },
      },
      onGpsPosition: (position: GpsPosition) => {
        gpsFixCount += 1;
        lastGps = toGpsSeed(position);
        gpsHandler(position);
        if (orchestrator) {
          orchestrator.adapter.setGpsPosition(position);
        }
        updateHud();
      },
      onOrientation: (orientation: RawDeviceOrientation) => {
        updateDeviceOrientation(orientation);
      },
    });
  });

  void controller.refreshSupport();
}

main();
