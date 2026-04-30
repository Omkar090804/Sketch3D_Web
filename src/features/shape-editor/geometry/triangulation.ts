export type Vertex3D = { x: number; y: number; z: number };
export type Triangle = [Vertex3D, Vertex3D, Vertex3D];

export function quadToTriangles(points: any[]): Triangle[] {
  const [p0, p1, p2, p3] = points;

  return [
    [{ ...p0, z: 0 }, { ...p1, z: 0 }, { ...p2, z: 0 }],
    [{ ...p0, z: 0 }, { ...p2, z: 0 }, { ...p3, z: 0 }],
  ];
}

export function circleToTriangles(center: any, radius: number): Triangle[] {
  const triangles: Triangle[] = [];
  const segments = 40;

  for (let i = 0; i < segments; i++) {
    const a1 = (i / segments) * 2 * Math.PI;
    const a2 = ((i + 1) / segments) * 2 * Math.PI;

    const p1 = {
      x: center.x + radius * Math.cos(a1),
      y: center.y + radius * Math.sin(a1),
      z: 0,
    };

    const p2 = {
      x: center.x + radius * Math.cos(a2),
      y: center.y + radius * Math.sin(a2),
      z: 0,
    };

    triangles.push([{ ...center, z: 0 }, p1, p2]);
  }

  return triangles;
}

export function extrude(points: any[], height: number) {
  const [p0, p1, p2, p3] = points;

  const to3D = (p: any, z: number) => ({ x: p.x, y: p.y, z });

  const b0 = to3D(p0, 0);
  const b1 = to3D(p1, 0);
  const b2 = to3D(p2, 0);
  const b3 = to3D(p3, 0);

  const t0 = to3D(p0, height);
  const t1 = to3D(p1, height);
  const t2 = to3D(p2, height);
  const t3 = to3D(p3, height);

  return [
    [t0, t1, t2],
    [t0, t2, t3],
    [b0, b2, b1],
    [b0, b3, b2],
    [b0, b1, t1],
    [b0, t1, t0],
    [b1, b2, t2],
    [b1, t2, t1],
    [b2, b3, t3],
    [b2, t3, t2],
    [b3, b0, t0],
    [b3, t0, t3],
  ];
}

export function sphereToTriangles(
  center: { x: number; y: number },
  radius: number,
  widthSegments = 32,
  heightSegments = 16
): Triangle[] {
  const triangles: Triangle[] = [];

  const pointFromAngles = (theta: number, phi: number): Vertex3D => ({
    x: center.x + radius * Math.sin(theta) * Math.cos(phi),
    y: center.y + radius * Math.sin(theta) * Math.sin(phi),
    z: radius * Math.cos(theta),
  });

  for (let y = 0; y < heightSegments; y++) {
    const theta1 = (y / heightSegments) * Math.PI;
    const theta2 = ((y + 1) / heightSegments) * Math.PI;

    for (let x = 0; x < widthSegments; x++) {
      const phi1 = (x / widthSegments) * 2 * Math.PI;
      const phi2 = ((x + 1) / widthSegments) * 2 * Math.PI;

      const p1 = pointFromAngles(theta1, phi1);
      const p2 = pointFromAngles(theta2, phi1);
      const p3 = pointFromAngles(theta2, phi2);
      const p4 = pointFromAngles(theta1, phi2);

      if (y === 0) {
        triangles.push([p1, p2, p3]);
      } else if (y === heightSegments - 1) {
        triangles.push([p1, p2, p4]);
      } else {
        triangles.push([p1, p2, p3]);
        triangles.push([p1, p3, p4]);
      }
    }
  }

  return triangles;
}
