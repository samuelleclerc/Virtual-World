class Tree {
  constructor(center, size, height = 200) {
    this.center = center;
    this.size = size; // Size of the base of the tree
    this.height = height;
    this.base = this.#generateLevel(center, size);
  }

  #generateLevel(point, size) {
    const points = [];
    const radius = size / 2;

    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 16) {
      const halfRandom = Math.cos(((angle + this.center.x) * size) % 17) ** 2;
      const noisyRadius = radius * linearInterpolation(0.5, 1, halfRandom);
      points.push(translate(point, angle, noisyRadius));
    }

    return new Polygon(points);
  }

  draw(context, viewpoint) {
    const top = imitate3DPoint(this.center, viewpoint, this.height);

    const levelCount = 7;
    for (let level = 0; level < levelCount; level++) {
      const t = level / (levelCount - 1);
      const point = linearInterpolation2D(this.center, top, t);
      const color = `rgb(30, ${linearInterpolation(50, 200, t)}, 70)`;
      const size = linearInterpolation(this.size, 40, t);
      const polygon = this.#generateLevel(point, size);
      polygon.draw(context, { fill: color, stroke: "rgba(0,0,0,0)" });
    }
  }
}
