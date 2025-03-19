class World {
  constructor(
    graph,
    roadWidth = 100,
    roadRoundness = 10,
    buildingWidth = 150,
    buildingMinimumLength = 150,
    spacing = 50,
    treeSize = 160,
  ) {
    this.graph = graph;
    this.roadWidth = roadWidth;
    this.roadRoundness = roadRoundness;
    this.buildingWidth = buildingWidth;
    this.buildingMinimumLength = buildingMinimumLength;
    this.spacing = spacing;
    this.treeSize = treeSize;

    this.envelopes = [];
    this.roadBorders = [];
    this.buildings = [];
    this.trees = [];
    this.laneGuides = [];

    this.markings = [];

    this.frameCount = 0;

    this.generate();
  }

  generate() {
    this.envelopes = [];

    for (const segment of this.graph.segments) {
      this.envelopes.push(
        new Envelope(segment, this.roadWidth, this.roadRoundness),
      );
    }

    this.roadBorders = Polygon.union(
      this.envelopes.map((envelope) => envelope.polygon),
    );
    this.buildings = this.#generateBuildings();
    this.trees = this.#generateTrees();

    this.laneGuides = [];
    this.laneGuides.push(...this.#generateLaneGuides());
  }

  #isValidTreePlacement(point, invalidPolygons, trees) {
    // Check if tree is inside/nearby building/road
    if (
      invalidPolygons.some(
        (polygon) =>
          polygon.containsPoint(point) ||
          polygon.distanceToPoint(point) < this.treeSize / 2,
      )
    )
      return false;

    // Check if tree is too close to other trees
    if (trees.some((tree) => distance(tree.center, point) < this.treeSize))
      return false;

    // Check if tree is too far from anything
    return invalidPolygons.some(
      (polygon) => polygon.distanceToPoint(point) < this.treeSize * 2,
    );
  }

  #generateLaneGuides() {
    const tempEnvelopes = [];

    for (const segment of this.graph.segments) {
      tempEnvelopes.push(
        new Envelope(segment, this.roadWidth / 2, this.roadRoundness),
      );
    }

    return Polygon.union(tempEnvelopes.map((envelope) => envelope.polygon));
  }

  #generateTrees() {
    const points = [
      ...this.roadBorders
        .map((segment) => [segment.point1, segment.point2])
        .flat(),
      ...this.buildings.map((building) => building.base.points).flat(),
    ];

    const left = Math.min(...points.map((point) => point.x));
    const right = Math.max(...points.map((point) => point.x));
    const top = Math.min(...points.map((point) => point.y));
    const bottom = Math.max(...points.map((point) => point.y));

    const invalidPolygons = [
      ...this.buildings.map((building) => building.base),
      ...this.envelopes.map((envelope) => envelope.polygon),
    ];

    const trees = [];
    let tryCount = 0;
    while (tryCount < 100) {
      const point = new Point(
        linearInterpolation(left, right, Math.random()),
        linearInterpolation(bottom, top, Math.random()),
      );

      if (this.#isValidTreePlacement(point, invalidPolygons, trees)) {
        trees.push(new Tree(point, this.treeSize));
        tryCount = 0;
      }
      tryCount++;
    }
    return trees;
  }

  #generateBuildings() {
    const tempEnvelopes = [];

    for (const segment of this.graph.segments) {
      tempEnvelopes.push(
        new Envelope(
          segment,
          this.roadWidth + this.buildingWidth + this.spacing * 2,
          this.roadRoundness,
        ),
      );
    }

    const guides = Polygon.union(
      tempEnvelopes.map((envelope) => envelope.polygon),
    );

    for (let i = 0; i < guides.length; i++) {
      const segment = guides[i];
      if (segment.length() < this.buildingMinimumLength) {
        guides.splice(i, 1);
        i--;
      }
    }

    const supports = [];

    for (let segment of guides) {
      const length = segment.length() + this.spacing;

      const buildingCount = Math.floor(
        length / (this.buildingMinimumLength + this.spacing),
      );
      const buildingLength = length / buildingCount - this.spacing;

      const direction = segment.directionVector();

      let q1 = segment.point1;
      let q2 = add(q1, scale(direction, buildingLength));
      supports.push(new Segment(q1, q2));

      for (let i = 2; i <= buildingCount; i++) {
        q1 = add(q2, scale(direction, this.spacing));
        q2 = add(q1, scale(direction, buildingLength));
        supports.push(new Segment(q1, q2));
      }
    }

    const bases = [];

    for (const support of supports) {
      bases.push(new Envelope(support, this.buildingWidth).polygon);
    }

    const epsilon = 0.001;
    for (let i = 0; i < bases.length - 1; i++) {
      for (let j = i + 1; j < bases.length; j++) {
        if (
          bases[i].intersectsPolygon(bases[j]) ||
          bases[i].distanceToPolygon(bases[j]) < this.spacing - epsilon
        ) {
          bases.splice(j, 1);
          j--;
        }
      }
    }
    return bases.map((base) => new Building(base));
  }

  #getIntersections() {
    const subset = [];

    console.log({ points: this.graph.points });
    console.log({ segments: this.graph.segments });

    for (const point of this.graph.points) {
      let degree = 0;

      for (const segment of this.graph.segments) {
        if (segment.includes(point)) {
          degree++;
        }
      }

      console.log(`Point ${point.x}, ${point.y} has degree:`, degree);

      if (degree > 2) {
        subset.push(point);
      }
    }

    console.log("Intersections:", subset);
    return subset;
  }

  #updateLights() {
    const lights = this.markings.filter((m) => m instanceof Light);
    const controlCenters = [];

    for (const light of lights) {
      const point = getNearestPoint(light.center, this.#getIntersections());
      let controlCenter = controlCenters.find((controlCenter) =>
        controlCenter.equals(point),
      );

      if (!controlCenter) {
        controlCenter = new Point(point.x, point.y);
        controlCenter.lights = [light];
        controlCenters.push(controlCenter);
      } else {
        controlCenter.lights.push(light);
      }
    }

    const greenDuration = 2;
    const yellowDuration = 1;

    for (const center of controlCenters) {
      center.ticks = center.lights.length * (greenDuration + yellowDuration);
    }

    const tick = Math.floor(this.frameCount / 60);

    for (const center of controlCenters) {
      const controlCenterTick = tick % center.ticks;
      const greenYellowIndex = Math.floor(
        controlCenterTick / (greenDuration + yellowDuration),
      );
      const greenYellowState =
        controlCenterTick % (greenDuration + yellowDuration) < greenDuration
          ? "green"
          : "yellow";

      for (let i = 0; i < center.lights.length; i++) {
        if (i === greenYellowIndex) {
          center.lights[i].state = greenYellowState;
        } else {
          center.lights[i].state = "red";
        }
      }
    }
    this.frameCount++;
  }

  draw(context, viewpoint) {
    this.#updateLights();

    for (const envelope of this.envelopes) {
      envelope.draw(context, { fill: "#BBB", stroke: "#BBB", lineWidth: 15 });
    }

    for (const marking of this.markings) {
      marking.draw(context);
    }

    for (const segment of this.graph.segments) {
      segment.draw(context, {
        color: "white",
        width: 4,
        dash: [10, 10],
      });
    }

    for (const segment of this.roadBorders) {
      segment.draw(context, { color: "white", width: 4 });
    }

    const items = [...this.buildings, ...this.trees];
    items.sort(
      (a, b) =>
        b.base.distanceToPoint(viewpoint) - a.base.distanceToPoint(viewpoint),
    );

    for (const item of items) {
      item.draw(context, viewpoint);
    }
  }
}
