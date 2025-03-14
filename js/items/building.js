class Building {
  constructor(polygon, height = 200) {
    this.base = polygon;
    this.height = height;
  }

  draw(context, viewpoint) {
    const topPoints = this.base.points.map((point) =>
      imitate3DPoint(point, viewpoint, this.height * 0.6),
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

    const baseMidpoints = [
      average(this.base.points[0], this.base.points[1]),
      average(this.base.points[2], this.base.points[3]),
    ];

    const topMidpoints = baseMidpoints.map((point) =>
      imitate3DPoint(point, viewpoint, this.height),
    );

    const roofPolygons = [
      new Polygon([
        ceiling.points[0],
        ceiling.points[3],
        topMidpoints[1],
        topMidpoints[0],
      ]),
      new Polygon([
        ceiling.points[2],
        ceiling.points[1],
        topMidpoints[0],
        topMidpoints[1],
      ]),
    ];

    roofPolygons.sort(
      (a, b) => b.distanceToPoint(viewpoint) - a.distanceToPoint(viewpoint),
    );

    this.base.draw(context, {
      fill: "white",
      stroke: "rgba(0,0,0,0.2)",
      lineWidth: 20,
    });

    for (const side of sides) {
      side.draw(context, { fill: "white", stroke: "#AAA" });
    }

    ceiling.draw(context, { fill: "white", stroke: "white", lineWidth: 6 });

    for (const polygon of roofPolygons) {
      polygon.draw(context, {
        fill: "#D44",
        stroke: "#C44",
        lineWidth: 8,
        join: "round",
      });
    }
  }
}
