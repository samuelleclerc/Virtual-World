class Segment {
  constructor(point1, point2) {
    this.point1 = point1;
    this.point2 = point2;
  }

  equals(segment) {
    return this.includes(segment.point1) && this.includes(segment.point2);
  }

  includes(point) {
    return this.point1.equals(point) || this.point2.equals(point);
  }

  draw(context, width = 2, color = "black") {
    context.beginPath();
    context.lineWidth = width;
    context.strokeStyle = color;
    context.moveTo(this.point1.x, this.point1.y);
    context.lineTo(this.point2.x, this.point2.y);
    context.stroke();
  }
}
