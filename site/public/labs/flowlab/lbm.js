const CX = new Int8Array([0, 1, 0, -1, 0, 1, -1, -1, 1]);
const CY = new Int8Array([0, 0, 1, 0, -1, 1, 1, -1, -1]);
const OPPOSITE = new Int8Array([0, 3, 4, 1, 2, 7, 8, 5, 6]);
const WEIGHTS = new Float64Array([4 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 36, 1 / 36, 1 / 36, 1 / 36]);

export class LBMSolver {
  constructor({ width = 66, height = 66, reynolds = 100, lidVelocity = 0.05 } = {}) {
    if (width < 10 || height < 10) throw new RangeError('width and height must be at least 10');
    if (!(reynolds > 0)) throw new RangeError('reynolds must be positive');
    if (!(lidVelocity > 0 && lidVelocity < 0.2)) throw new RangeError('lidVelocity must be between 0 and 0.2 lattice units');

    this.width = width;
    this.height = height;
    this.size = width * height;
    this.reynolds = reynolds;
    this.lidVelocity = lidVelocity;
    this.characteristicLength = height - 2;
    this.viscosity = (lidVelocity * this.characteristicLength) / reynolds;
    this.relaxationTime = 0.5 + 3 * this.viscosity;
    if (this.relaxationTime <= 0.5005) {
      throw new RangeError(`relaxation time ${this.relaxationTime.toFixed(6)} is too close to the BGK stability limit`);
    }
    this.omega = 1 / this.relaxationTime;
    this.iteration = 0;

    this.solid = new Uint8Array(this.size);
    this.wallUx = new Float64Array(this.size);
    this.wallUy = new Float64Array(this.size);
    this.rho = new Float64Array(this.size);
    this.ux = new Float64Array(this.size);
    this.uy = new Float64Array(this.size);
    this.f = new Float64Array(9 * this.size);
    this.post = new Float64Array(9 * this.size);
    this.next = new Float64Array(9 * this.size);
    this.vorticityField = new Float64Array(this.size);

    this.#configureCavity();
    this.reset();
  }

  #configureCavity() {
    const { width, height } = this;
    for (let x = 0; x < width; x += 1) {
      const bottom = x;
      const top = (height - 1) * width + x;
      this.solid[bottom] = 1;
      this.solid[top] = 1;
      this.wallUx[top] = this.lidVelocity;
    }
    for (let y = 0; y < height; y += 1) {
      this.solid[y * width] = 1;
      this.solid[y * width + width - 1] = 1;
    }
  }

  reset() {
    this.iteration = 0;
    this.rho.fill(1);
    this.ux.fill(0);
    this.uy.fill(0);
    for (let i = 0; i < 9; i += 1) {
      const offset = i * this.size;
      this.f.fill(WEIGHTS[i], offset, offset + this.size);
    }
  }

  setDrivingVelocity(velocity) {
    if (!(velocity >= 0 && velocity < 0.2)) {
      throw new RangeError('driving velocity must be between 0 and 0.2 lattice units');
    }
    const topRow = (this.height - 1) * this.width;
    for (let x = 1; x < this.width - 1; x += 1) {
      this.wallUx[topRow + x] = velocity;
    }
  }

  setVelocityAt(x, y, velocityX, velocityY) {
    if (x <= 0 || x >= this.width - 1 || y <= 0 || y >= this.height - 1) return false;
    const cell = y * this.width + x;
    if (this.solid[cell]) return false;

    const density = this.rho[cell] || 1;
    const velocitySquared = velocityX * velocityX + velocityY * velocityY;
    this.ux[cell] = velocityX;
    this.uy[cell] = velocityY;

    for (let i = 0; i < 9; i += 1) {
      const projection = CX[i] * velocityX + CY[i] * velocityY;
      this.f[i * this.size + cell] = WEIGHTS[i] * density
        * (1 + 3 * projection + 4.5 * projection * projection - 1.5 * velocitySquared);
    }
    return true;
  }

  step(count = 1) {
    for (let substep = 0; substep < count; substep += 1) {
      this.#collide();
      this.#streamAndBounce();
      [this.f, this.next] = [this.next, this.f];
      this.iteration += 1;
    }
    this.#updateMacroscopicFields();
  }

  #collide() {
    const { width, height, size, omega, f, post, rho, ux, uy, solid } = this;
    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        const cell = y * width + x;
        if (solid[cell]) continue;

        let density = 0;
        let momentumX = 0;
        let momentumY = 0;
        for (let i = 0; i < 9; i += 1) {
          const population = f[i * size + cell];
          density += population;
          momentumX += population * CX[i];
          momentumY += population * CY[i];
        }
        const velocityX = momentumX / density;
        const velocityY = momentumY / density;
        const velocitySquared = velocityX * velocityX + velocityY * velocityY;
        rho[cell] = density;
        ux[cell] = velocityX;
        uy[cell] = velocityY;

        for (let i = 0; i < 9; i += 1) {
          const projection = CX[i] * velocityX + CY[i] * velocityY;
          const equilibrium = WEIGHTS[i] * density * (1 + 3 * projection + 4.5 * projection * projection - 1.5 * velocitySquared);
          const index = i * size + cell;
          post[index] = f[index] - omega * (f[index] - equilibrium);
        }
      }
    }
  }

  #streamAndBounce() {
    const { width, height, size, post, next, rho, solid, wallUx, wallUy } = this;
    next.fill(0);
    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        const cell = y * width + x;
        if (solid[cell]) continue;

        for (let i = 0; i < 9; i += 1) {
          const destination = (y + CY[i]) * width + x + CX[i];
          const population = post[i * size + cell];
          if (solid[destination]) {
            const wallProjection = CX[i] * wallUx[destination] + CY[i] * wallUy[destination];
            next[OPPOSITE[i] * size + cell] = population - 6 * WEIGHTS[i] * rho[cell] * wallProjection;
          } else {
            next[i * size + destination] = population;
          }
        }
      }
    }
  }

  #updateMacroscopicFields() {
    const { width, height, size, f, rho, ux, uy, solid } = this;
    rho.fill(0);
    ux.fill(0);
    uy.fill(0);
    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        const cell = y * width + x;
        if (solid[cell]) continue;
        let density = 0;
        let momentumX = 0;
        let momentumY = 0;
        for (let i = 0; i < 9; i += 1) {
          const population = f[i * size + cell];
          density += population;
          momentumX += population * CX[i];
          momentumY += population * CY[i];
        }
        rho[cell] = density;
        ux[cell] = momentumX / density;
        uy[cell] = momentumY / density;
      }
    }
  }

  run({ maxSteps = 30_000, checkEvery = 250, tolerance = 1e-8, minimumSteps = 2_000 } = {}) {
    if (maxSteps <= 0 || checkEvery <= 0) throw new RangeError('run step counts must be positive');
    const previousUx = new Float64Array(this.size);
    const previousUy = new Float64Array(this.size);
    let residual = Number.POSITIVE_INFINITY;
    const history = [];

    while (this.iteration < maxSteps && residual > tolerance) {
      previousUx.set(this.ux);
      previousUy.set(this.uy);
      const batch = Math.min(checkEvery, maxSteps - this.iteration);
      this.step(batch);
      let squaredChange = 0;
      let fluidCells = 0;
      for (let cell = 0; cell < this.size; cell += 1) {
        if (this.solid[cell]) continue;
        const du = this.ux[cell] - previousUx[cell];
        const dv = this.uy[cell] - previousUy[cell];
        squaredChange += du * du + dv * dv;
        fluidCells += 1;
      }
      residual = Math.sqrt(squaredChange / fluidCells) / this.lidVelocity;
      history.push({ iteration: this.iteration, residual });
      if (this.iteration < minimumSteps) residual = Math.max(residual, tolerance * 2);
      if (!Number.isFinite(residual)) throw new Error(`solver diverged at iteration ${this.iteration}`);
    }

    return { converged: residual <= tolerance, iteration: this.iteration, residual, history };
  }

  mass() {
    let total = 0;
    for (let cell = 0; cell < this.size; cell += 1) {
      if (!this.solid[cell]) total += this.rho[cell];
    }
    return total;
  }

  sampleCenterlines(coordinates) {
    return {
      u: coordinates.map((coordinate) => ({ coordinate, value: this.#sample(this.ux, 0.5, coordinate, 'u') / this.lidVelocity })),
      v: coordinates.map((coordinate) => ({ coordinate, value: this.#sample(this.uy, coordinate, 0.5, 'v') / this.lidVelocity })),
    };
  }

  #sample(field, x, y, component) {
    if (y <= 0 || x <= 0 || x >= 1) return 0;
    if (y >= 1) return component === 'u' ? this.lidVelocity : 0;
    const fluidWidth = this.width - 2;
    const fluidHeight = this.height - 2;
    const gridX = x * fluidWidth + 0.5;
    const gridY = y * fluidHeight + 0.5;
    const x0 = Math.max(1, Math.min(this.width - 2, Math.floor(gridX)));
    const x1 = Math.max(1, Math.min(this.width - 2, Math.ceil(gridX)));
    const y0 = Math.max(1, Math.min(this.height - 2, Math.floor(gridY)));
    const y1 = Math.max(1, Math.min(this.height - 2, Math.ceil(gridY)));
    const tx = gridX - Math.floor(gridX);
    const ty = gridY - Math.floor(gridY);
    const q00 = field[y0 * this.width + x0];
    const q10 = field[y0 * this.width + x1];
    const q01 = field[y1 * this.width + x0];
    const q11 = field[y1 * this.width + x1];
    const bottom = q00 * (1 - tx) + q10 * tx;
    const top = q01 * (1 - tx) + q11 * tx;
    return bottom * (1 - ty) + top * ty;
  }

  vorticity() {
    const field = this.vorticityField;
    field.fill(0);
    for (let y = 1; y < this.height - 1; y += 1) {
      for (let x = 1; x < this.width - 1; x += 1) {
        const cell = y * this.width + x;
        const dvdx = (this.uy[cell + 1] - this.uy[cell - 1]) * 0.5;
        const dudy = (this.ux[cell + this.width] - this.ux[cell - this.width]) * 0.5;
        field[cell] = dvdx - dudy;
      }
    }
    return field;
  }
}

export const lattice = Object.freeze({ cx: CX, cy: CY, weights: WEIGHTS, opposite: OPPOSITE });
