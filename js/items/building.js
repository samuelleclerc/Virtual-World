class Building {
  constructor(polygon, heightCoefficient = 0.4) {
    this.base = polygon;
    this.heightCoefficient = heightCoefficient;
  }

  draw(context, viewpoint) {
    const topPoints = this.base.points.map((point) =>
      add(point, scale(subtract(point, viewpoint), this.heightCoefficient)),
    );
    const ceiling = new Polygon(topPoints);

    const sides = [];
    for (let i = 0; i < this.base.points.length; i++) {
      const nextIndex = (i + 1) % this.base.points.length;
      const polygon = new Polygon([
        this.base.points[i],
        this.base.points[nextIndex],
        topPoints[nextIndex],
        topPoints[i],
      ]);
      sides.push(polygon);
    }

    sides.sort(
      (a, b) => b.distanceToPoint(viewpoint) - a.distanceToPoint(viewpoint),
    );

    this.base.draw(context, { fill: "white", stroke: "#AAA" });

    for (const side of sides) {
      side.draw(context, { fill: "white", stroke: "#AAA" });
    }

    ceiling.draw(context, { fill: "white", stroke: "#AAA" });
  }
}
