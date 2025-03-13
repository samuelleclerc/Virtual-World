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

    this.generate();
  }

  generate() {
    this.envelopes.length = 0;

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
  }

  #generateTrees() {
    const points = [
      ...this.roadBorders
        .map((segment) => [segment.point1, segment.point2])
        .flat(),
      ...this.buildings.map((building) => building.points).flat(),
    ];

    const left = Math.min(...points.map((point) => point.x));
    const right = Math.max(...points.map((point) => point.x));
    const top = Math.min(...points.map((point) => point.y));
    const bottom = Math.max(...points.map((point) => point.y));

    const invalidPolygons = [
      ...this.buildings,
      ...this.envelopes.map((envelope) => envelope.polygon),
    ];

    const trees = [];
    let tryCount = 0;
    while (tryCount < 100) {
      const point = new Point(
        linearInterpolation(left, right, Math.random()),
        linearInterpolation(bottom, top, Math.random()),
      );

      // TODO: Create separate function for all the following operations
      // Check if tree is inside/nearby building/road
      let keep = true;
      for (const polygon of invalidPolygons) {
        if (
          polygon.containsPoint(point) ||
          polygon.distanceToPoint(point) < this.treeSize / 2
        ) {
          keep = false;
          break;
        }
      }

      // Check if tree is too close to other trees
      if (keep) {
        for (const tree of trees) {
          if (distance(tree, point) < this.treeSize) {
            keep = false;
            break;
          }
        }
      }

      // Check if tree is too far from anything
      if (keep) {
        let closeToSomething = false;
        for (const polygon of invalidPolygons) {
          if (polygon.distanceToPoint(point) < this.treeSize * 2) {
            closeToSomething = true;
            break;
          }
        }
        keep = closeToSomething;
      }

      if (keep) {
        trees.push(point);
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
      for (let j = i + 1; j < bases.length - 1; j++) {
        if (
          bases[i].intersectsPolygon(bases[j]) ||
          bases[i].distanceToPolygon(bases[j]) < this.spacing - epsilon
        ) {
          bases.splice(j, 1);
          j--;
        }
      }
    }
    return bases;
  }

  draw(context) {
    for (const envelope of this.envelopes) {
      envelope.draw(context, { fill: "#BBB", stroke: "#BBB", lineWidth: 15 });
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

    for (const tree of this.trees) {
      tree.draw(context, { size: this.treeSize, color: "rgba(0,0,0,0.5)" });
    }

    for (const building of this.buildings) {
      building.draw(context);
    }
  }
}
