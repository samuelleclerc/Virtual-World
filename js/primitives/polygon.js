class Polygon {
  constructor(points) {
    this.points = points;
    this.segments = [];
    for (let i = 1; i <= points.length; i++) {
      this.segments.push(new Segment(points[i - 1], points[i % points.length]));
    }
  }

  static union(polygons) {
    Polygon.multiBreak(polygons);
    const keptSegments = [];

    for (let i = 0; i < polygons.length; i++) {
      for (const segment of polygons[i].segments) {
        let keep = true;
        for (let j = 0; j < polygons.length; j++) {
          if (i !== j) {
            if (polygons[j].containsSegment(segment)) {
              keep = false;
              break;
            }
          }
        }
        if (keep) {
          keptSegments.push(segment);
        }
      }
    }

    return keptSegments;
  }

  static multiBreak(polygons) {
    for (let i = 0; i < polygons.length - 1; i++) {
      for (let j = i + 1; j < polygons.length; j++) {
        Polygon.break(polygons[i], polygons[j]);
      }
    }
  }

  static break(polygon1, polygon2) {
    const segments1 = polygon1.segments;
    const segments2 = polygon2.segments;
    for (let i = 0; i < segments1.length; i++) {
      for (let j = 0; j < segments2.length; j++) {
        const intersection = getIntersection(
          segments1[i].point1,
          segments1[i].point2,
          segments2[j].point1,
          segments2[j].point2,
        );

        if (
          intersection &&
          intersection.offset !== 1 &&
          intersection.offset !== 0
        ) {
          const point = new Point(intersection.x, intersection.y);

          let aux = segments1[i].point2;
          segments1[i].point2 = point;
          segments1.splice(i + 1, 0, new Segment(point, aux));

          aux = segments2[j].point2;
          segments2[j].point2 = point;
          segments2.splice(j + 1, 0, new Segment(point, aux));
        }
      }
    }
  }

  // TODO: Refactor to actually calculate if contains segment & replace containsPoint
  containsSegment(segment) {
    const midpoint = average(segment.point1, segment.point2);
    return this.containsPoint(midpoint);
  }

  containsPoint(point) {
    const outerPoint = new Point(-1000, -1000);
    let intersectionCount = 0;
    for (const segment of this.segments) {
      const intersection = getIntersection(
        outerPoint,
        point,
        segment.point1,
        segment.point2,
      );
      if (intersection) {
        intersectionCount++;
      }
    }

    return intersectionCount % 2 === 1;
  }

  draw(
    context,
    { stroke = "blue", lineWidth = 2, fill = "rgba(0,0,255,0.3)" } = {},
  ) {
    context.beginPath();
    context.fillStyle = fill;
    context.strokeStyle = stroke;
    context.lineWidth = lineWidth;
    context.moveTo(this.points[0].x, this.points[0].y);
    for (let i = 1; i < this.points.length; i++) {
      context.lineTo(this.points[i].x, this.points[i].y);
    }
    context.closePath();
    context.fill();
    context.stroke();
  }
}
