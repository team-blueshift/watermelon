/**
 * Physics Engine
 * Matter.js wrapper for game physics simulation
 */

import Matter from 'matter-js';
import { ENGINE_OPTIONS, getFruitBodyOptions, getWallBodyOptions } from '@/config/physics';
import { GAME_CONFIG } from '@/config/game';
import { getFruitConfig } from '@/config/fruits';
import type { FruitLevel, FruitBody } from '@/types';

const { Engine, World, Bodies, Body, Events } = Matter;

/**
 * Collision event data
 */
export interface CollisionEvent {
  bodyA: Matter.Body;
  bodyB: Matter.Body;
}

/**
 * Physics event callbacks
 */
export interface PhysicsEventCallbacks {
  onCollision?: (event: CollisionEvent) => void;
  onAfterUpdate?: () => void;
}

/**
 * PhysicsEngine class
 * Manages Matter.js physics simulation
 */
export class PhysicsEngine {
  private engine: Matter.Engine;
  private world: Matter.World;
  private callbacks: PhysicsEventCallbacks = {};

  constructor() {
    this.engine = Engine.create(ENGINE_OPTIONS);
    this.world = this.engine.world;
    this.setupWalls();
    this.setupEvents();
  }

  /**
   * Get the Matter.js engine instance
   */
  getEngine(): Matter.Engine {
    return this.engine;
  }

  /**
   * Get the Matter.js world instance
   */
  getWorld(): Matter.World {
    return this.world;
  }

  /**
   * Set event callbacks
   */
  setCallbacks(callbacks: PhysicsEventCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Create walls (floor, left wall, right wall)
   * Walls are positioned inside the visible canvas area
   */
  private setupWalls(): void {
    const { width, height, wallThickness } = GAME_CONFIG;
    const wallOptions = getWallBodyOptions();

    // Floor - at bottom inside visible area
    const floor = Bodies.rectangle(
      width / 2,
      height - wallThickness / 2,
      width,
      wallThickness,
      { ...wallOptions, label: 'floor' }
    );

    // Left wall - at left edge inside visible area
    const leftWall = Bodies.rectangle(
      wallThickness / 2,
      height / 2,
      wallThickness,
      height,
      { ...wallOptions, label: 'wall_left' }
    );

    // Right wall - at right edge inside visible area
    const rightWall = Bodies.rectangle(
      width - wallThickness / 2,
      height / 2,
      wallThickness,
      height,
      { ...wallOptions, label: 'wall_right' }
    );

    World.add(this.world, [floor, leftWall, rightWall]);
  }

  /**
   * Setup collision events
   */
  private setupEvents(): void {
    Events.on(this.engine, 'collisionStart', (event) => {
      if (this.callbacks.onCollision) {
        for (const pair of event.pairs) {
          this.callbacks.onCollision({
            bodyA: pair.bodyA,
            bodyB: pair.bodyB,
          });
        }
      }
    });

    Events.on(this.engine, 'afterUpdate', () => {
      if (this.callbacks.onAfterUpdate) {
        this.callbacks.onAfterUpdate();
      }
    });
  }

  /**
   * Create a fruit body
   * @param x - X position
   * @param y - Y position
   * @param level - Fruit level (1-11)
   * @returns Matter.js body with fruit data
   */
  createFruit(x: number, y: number, level: FruitLevel): FruitBody {
    const config = getFruitConfig(level);
    const fruitOptions = getFruitBodyOptions();

    const body = Bodies.circle(x, y, config.radius, {
      ...fruitOptions,
      label: `fruit_${level}`,
      render: {
        fillStyle: config.color,
      },
    }) as FruitBody;

    // Attach fruit level as plugin data
    body.plugin = { fruitLevel: level };

    return body;
  }

  /**
   * Add a body to the world
   */
  addBody(body: Matter.Body): void {
    World.add(this.world, body);
  }

  /**
   * Remove a body from the world
   */
  removeBody(body: Matter.Body): void {
    World.remove(this.world, body);
  }

  /**
   * Remove multiple bodies from the world
   */
  removeBodies(bodies: Matter.Body[]): void {
    World.remove(this.world, bodies);
  }

  /**
   * Get all fruit bodies in the world
   */
  getFruits(): FruitBody[] {
    return this.world.bodies.filter(
      (body): body is FruitBody => body.label?.startsWith('fruit_') ?? false
    );
  }

  /**
   * Update physics simulation
   * @param delta - Time step in milliseconds
   */
  update(delta: number): void {
    Engine.update(this.engine, delta);
  }

  /**
   * Set body velocity
   */
  setVelocity(body: Matter.Body, velocity: { x: number; y: number }): void {
    Body.setVelocity(body, velocity);
  }

  /**
   * Set body position
   */
  setPosition(body: Matter.Body, position: { x: number; y: number }): void {
    Body.setPosition(body, position);
  }

  /**
   * Clear all fruits from the world
   */
  clearFruits(): void {
    const fruits = this.getFruits();
    this.removeBodies(fruits);
  }

  /**
   * Reset the physics engine
   */
  reset(): void {
    this.clearFruits();
  }

  /**
   * Destroy the physics engine
   */
  destroy(): void {
    Events.off(this.engine, 'collisionStart', undefined as never);
    Events.off(this.engine, 'afterUpdate', undefined as never);
    World.clear(this.world, false);
    Engine.clear(this.engine);
  }
}
