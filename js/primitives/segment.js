class Segment {
  constructor(point1, point2) {
    this.point1 = point1;
    this.point2 = point2;
  }

  length() {
    return distance(this.point1, this.point2);
  }

  directionVector() {
    return normalize(subtract(this.point2, this.point1));
  }

  equals(segment) {
    return this.includes(segment.point1) && this.includes(segment.point2);
  }

  includes(point) {
    return this.point1.equals(point) || this.point2.equals(point);
  }

  distanceToPoint(point) {
    const projection = this.projectPoint(point);
    if (projection.offset > 0 && projection.offset < 1) {
      return distance(point, projection.point);
    }

    const distanceToPoint1 = distance(point, this.point1);
    const distanceToPoint2 = distance(point, this.point2);
    return Math.min(distanceToPoint1, distanceToPoint2);
  }

  projectPoint(point) {
    const a = subtract(point, this.point1);
    const b = subtract(this.point2, this.point1);
    const normalizedB = normalize(b);
    const scalar = dot(a, normalizedB);
    return {
      point: add(this.point1, scale(normalizedB, scalar)),
      offset: scalar / magnitude(b),
    };
  }

  draw(context, { width = 2, color = "black", dash = [], cap = "butt" } = {}) {
    context.beginPath();
    context.lineWidth = width;
    context.strokeStyle = color;
    context.lineCap = cap;
    context.setLineDash(dash);
    context.moveTo(this.point1.x, this.point1.y);
    context.lineTo(this.point2.x, this.point2.y);
    context.stroke();
    context.setLineDash([]);
  }
}
