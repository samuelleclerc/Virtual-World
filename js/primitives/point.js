class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  equals(point) {
    return this.x === point.x && this.y === point.y;
  }

  draw(context, size = 18, color = "black") {
    const radius = size / 2;
    context.beginPath();
    context.fillStyle = color;
    context.arc(this.x, this.y, radius, 0, Math.PI * 2);
    context.fill();
  }
}
