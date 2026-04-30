export type Point = {
  x: number;
  y: number;
};

export type Shape2D =
  | { type: "rectangle"; points: Point[] }
  | { type: "square"; points: Point[] }
  | { type: "circle"; center: Point; radius: number };

export function createRectangle(p1: Point, p2: Point): Shape2D {
  const minX = Math.min(p1.x, p2.x);
  const maxX = Math.max(p1.x, p2.x);
  const minY = Math.min(p1.y, p2.y);
  const maxY = Math.max(p1.y, p2.y);

  return {
    type: "rectangle",
    points: [
      { x: minX, y: minY },
      { x: minX, y: maxY },
      { x: maxX, y: maxY },
      { x: maxX, y: minY },
    ],
  };
}

export function createSquare(p1: Point, p2: Point): Shape2D {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;

  const size = Math.max(Math.abs(dx), Math.abs(dy));

  const signX = dx >= 0 ? 1 : -1;
  const signY = dy >= 0 ? 1 : -1;

  const x2 = p1.x + size * signX;
  const y2 = p1.y + size * signY;

  return {
    type: "square",
    points: [
      p1,
      { x: p1.x, y: y2 },
      { x: x2, y: y2 },
      { x: x2, y: p1.y },
    ],
  };
}

export function resizeSquare(shape: any, i: number, p: Point): Shape2D {
  const fixed = shape.points[(i + 2) % 4];

  const dx = p.x - fixed.x;
  const dy = p.y - fixed.y;

  const size = Math.max(Math.abs(dx), Math.abs(dy));

  const signX = dx >= 0 ? 1 : -1;
  const signY = dy >= 0 ? 1 : -1;

  const newX = fixed.x + size * signX;
  const newY = fixed.y + size * signY;

  const points = [...shape.points];

  points[i] = { x: newX, y: newY };
  points[(i + 1) % 4] = { x: newX, y: fixed.y };
  points[(i + 3) % 4] = { x: fixed.x, y: newY };

  return { type: "square", points };
}

export function resizeRectangle(shape: any, i: number, p: Point): Shape2D {
  const fixed = shape.points[(i + 2) % 4];

  const points = [...shape.points];

  points[i] = p;
  points[(i + 1) % 4] = { x: p.x, y: fixed.y };
  points[(i + 3) % 4] = { x: fixed.x, y: p.y };

  return { type: "rectangle", points };
}

export function createCircle(center: Point, edge: Point): Shape2D {
  const dx = edge.x - center.x;
  const dy = edge.y - center.y;
  const radius = Math.sqrt(dx * dx + dy * dy);

  return { type: "circle", center, radius };
}

export function resizeCircle(shape: any, p: Point): Shape2D {
  return createCircle(shape.center, p);
}
