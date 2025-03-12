function getNearestPoint(
  location,
  points,
  threshold = Number.MAX_SAFE_INTEGER,
) {
  let minimumDistance = Number.MAX_SAFE_INTEGER;
  let nearestPoint = null;

  for (const point of points) {
    const dist = distance(point, location);
    if (dist < minimumDistance && dist < threshold) {
      minimumDistance = dist;
      nearestPoint = point;
    }
  }

  return nearestPoint;
}

function distance(point1, point2) {
  return Math.hypot(point1.x - point2.x, point1.y - point2.y);
}

function add(point1, point2) {
  return new Point(point1.x + point2.x, point1.y + point2.y);
}

function subtract(point1, point2) {
  return new Point(point1.x - point2.x, point1.y - point2.y);
}

function scale(point, scale) {
  return new Point(point.x * scale, point.y * scale);
}
