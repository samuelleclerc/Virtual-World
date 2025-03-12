class Envelope {
  constructor(skeleton, width, roundness = 1) {
    this.skeleton = skeleton;
    this.polygon = this.#generatePolygon(width, roundness);
  }

  #generatePolygon(width, roundness) {
    const { point1, point2 } = this.skeleton;

    const radius = width / 2;
    const alpha = angle(subtract(point1, point2));
    const alphaClockwise = alpha + Math.PI / 2;
    const alphaCounterClockwise = alpha - Math.PI / 2;

    const points = [];
    const step = Math.PI / Math.max(1, roundness);
    const epsilon = step / 2;
    for (
      let i = alphaCounterClockwise;
      i <= alphaClockwise + epsilon;
      i += step
    ) {
      points.push(translate(point1, i, radius));
    }

    for (
      let i = alphaCounterClockwise;
      i <= alphaClockwise + epsilon;
      i += step
    ) {
      points.push(translate(point2, Math.PI + i, radius));
    }

    return new Polygon(points);
  }

  draw(context, options) {
    this.polygon.draw(context, options);
  }
}
