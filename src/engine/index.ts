/**
 * Engine module exports
 */

export { PhysicsEngine } from './PhysicsEngine';
export type { CollisionEvent, PhysicsEventCallbacks } from './PhysicsEngine';

export { CollisionHandler } from './CollisionHandler';
export type { MergeCallback, WatermelonVanishCallback } from './CollisionHandler';

export { GameLoop } from './GameLoop';
export type { GameLoopCallback } from './GameLoop';

export { DeadlineChecker } from './DeadlineChecker';
export type { GameOverCallback, DeadlineWarningCallback } from './DeadlineChecker';
