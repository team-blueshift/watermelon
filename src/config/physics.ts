/**
 * Physics engine configuration
 * Based on specs/physics-spec.md
 */

import type { PhysicsConfig } from '@/types';

/**
 * Physics configuration for Matter.js
 * These values control the behavior of the physics simulation
 */
export const PHYSICS_CONFIG: PhysicsConfig = {
  /**
   * Gravity settings
   */
  gravity: 1, // Gravity direction (downward)
  gravityScale: 0.001, // Gravity strength multiplier

  /**
   * Fruit physics properties
   * These properties affect how fruits behave when they collide and move
   */
  fruit: {
    /**
     * Friction coefficient (0-1)
     * Higher values make fruits slide less
     * 0 = frictionless, 1 = maximum friction
     */
    friction: 0.1,

    /**
     * Air resistance coefficient
     * Higher values slow down movement through air
     */
    frictionAir: 0.01,

    /**
     * Restitution/elasticity (0-1)
     * Controls how much fruits bounce on collision
     * 0 = no bounce (inelastic), 1 = perfect bounce (elastic)
     */
    restitution: 0.2,

    /**
     * Density
     * Affects the mass of fruits (mass = density × area)
     */
    density: 0.001,

    /**
     * Collision tolerance (slop)
     * Small penetration allowed before collision resolution
     */
    slop: 0.01,
  },

  /**
   * Wall physics properties
   * Properties for static boundaries (floor, walls)
   */
  wall: {
    /**
     * Static flag
     * Static bodies don't move and have infinite mass
     */
    isStatic: true,

    /**
     * Wall friction
     * Affects how fruits slide against walls
     */
    friction: 0.3,

    /**
     * Wall restitution
     * Controls how much fruits bounce off walls
     */
    restitution: 0.1,
  },
};

/**
 * Physics engine options for Matter.js
 * These are passed to Engine.create()
 */
export const ENGINE_OPTIONS = {
  /**
   * Gravity configuration
   */
  gravity: {
    x: 0, // No horizontal gravity
    y: PHYSICS_CONFIG.gravity, // Downward gravity
    scale: PHYSICS_CONFIG.gravityScale,
  },

  /**
   * Disable sleeping to prevent fruits from floating in mid-air
   * When enabled, bodies that haven't moved may stop responding to physics
   */
  enableSleeping: false,

  /**
   * Position iterations
   * Higher values = more accurate but slower simulation
   */
  positionIterations: 6,

  /**
   * Velocity iterations
   * Higher values = more accurate velocity calculations
   */
  velocityIterations: 4,
};

/**
 * Collision filter categories
 * Used for selective collision detection
 */
export const COLLISION_CATEGORIES = {
  FRUIT: 0x0001, // Fruits can collide with everything
  WALL: 0x0002, // Walls can collide with everything
  SENSOR: 0x0004, // Sensors (for detection zones)
} as const;

/**
 * Get fruit body options for Matter.js Bodies.circle()
 * @returns Matter.js body options for fruits
 */
export function getFruitBodyOptions() {
  return {
    friction: PHYSICS_CONFIG.fruit.friction,
    frictionAir: PHYSICS_CONFIG.fruit.frictionAir,
    restitution: PHYSICS_CONFIG.fruit.restitution,
    density: PHYSICS_CONFIG.fruit.density,
    slop: PHYSICS_CONFIG.fruit.slop,
    collisionFilter: {
      category: COLLISION_CATEGORIES.FRUIT,
      mask: COLLISION_CATEGORIES.FRUIT | COLLISION_CATEGORIES.WALL,
    },
  };
}

/**
 * Get wall body options for Matter.js Bodies.rectangle()
 * @returns Matter.js body options for walls
 */
export function getWallBodyOptions() {
  return {
    isStatic: PHYSICS_CONFIG.wall.isStatic,
    friction: PHYSICS_CONFIG.wall.friction,
    restitution: PHYSICS_CONFIG.wall.restitution,
    collisionFilter: {
      category: COLLISION_CATEGORIES.WALL,
      mask: COLLISION_CATEGORIES.FRUIT,
    },
  };
}
