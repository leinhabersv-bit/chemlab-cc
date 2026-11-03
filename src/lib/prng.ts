/**
 * Deterministic Pseudo-Random Number Generator (Mulberry32)
 * Ensures reproducible simulations with controlled Gaussian instrumentation noise.
 */
export class PRNG {
  private state: number;

  constructor(seed: number = 1337) {
    this.state = seed | 0;
  }

  /** Returns uniform pseudo-random number in [0, 1) */
  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Returns a Gaussian-distributed random number with given mean and standard deviation
   * Uses the Box-Muller transform.
   */
  nextGaussian(mean: number = 0, stdDev: number = 1): number {
    let u1 = this.next();
    let u2 = this.next();
    // Avoid log(0)
    while (u1 <= 1e-15) {
      u1 = this.next();
    }
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return mean + z0 * stdDev;
  }

  /** Add percentage relative noise to a value, clamped to min/max */
  addRelativeNoise(value: number, relativeStdDev: number, min?: number, max?: number): number {
    const noisy = value + this.nextGaussian(0, Math.abs(value) * relativeStdDev);
    if (min !== undefined && noisy < min) return min;
    if (max !== undefined && noisy > max) return max;
    return noisy;
  }
}

/** Global default PRNG instance */
export const defaultPRNG = new PRNG(2026);

