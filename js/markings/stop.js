class Stop extends Marking {
  constructor(center, directionVector, width, height) {
    super(center, directionVector, width, height);

    this.border = this.polygon.segments[2];
  }

  draw(context) {
    this.border.draw(context, { width: 5, color: "white" });
    context.save();
    context.translate(this.center.x, this.center.y);
    context.rotate(angle(this.directionVector) - Math.PI / 2);
    context.scale(1, 3);

    context.beginPath();
    context.textBaseline = "middle";
    context.textAlign = "center";
    context.fillStyle = "white";
    context.font = `bold ${this.height * 0.3}px Arial`;
    context.fillText("STOP", 0, 1);

    context.restore();
  }
}
