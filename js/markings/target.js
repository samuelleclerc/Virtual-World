class Target extends Marking {
  constructor(center, directionVector, width, height) {
    super(center, directionVector, width, height);

    this.border = this.polygon.segments[2];
  }

  draw(context) {
    this.center.draw(context, { color: "red", size: 30 });
    this.center.draw(context, { color: "white", size: 20 });
    this.center.draw(context, { color: "red", size: 10 });
  }
}
