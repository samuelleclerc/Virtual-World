class Parking extends Marking {
  constructor(center, directionVector, width, height) {
    super(center, directionVector, width, height);

    this.borders = [this.polygon.segments[0], this.polygon.segments[2]];
  }

  draw(context) {
    for (const border of this.borders) {
      border.draw(context, { width: 5, color: "white" });
    }
    context.save();
    context.translate(this.center.x, this.center.y);
    context.rotate(angle(this.directionVector));

    context.beginPath();
    context.textBaseline = "middle";
    context.textAlign = "center";
    context.fillStyle = "white";
    context.font = `bold ${this.height * 0.9}px Arial`;
    context.fillText("P", 0, 3);

    context.restore();
  }
}
