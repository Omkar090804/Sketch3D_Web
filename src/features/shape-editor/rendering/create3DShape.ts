import * as THREE from "three";
import { Shape2D } from "../geometry/shapes2D";
import { extrude } from "../geometry/triangulation";

export function create3DShape(shape: Shape2D): THREE.Mesh {
  if (shape.type === "circle") {
    return new THREE.Mesh(
      new THREE.SphereGeometry(shape.radius, 32, 32),
      new THREE.MeshNormalMaterial()
    );
  }

  let height = 50;

  if (shape.type === "square") {
    const dx = shape.points[0].x - shape.points[1].x;
    const dy = shape.points[0].y - shape.points[1].y;
    height = Math.sqrt(dx * dx + dy * dy);
  }

  if (shape.type === "rectangle") {
    const width = Math.abs(shape.points[2].x - shape.points[0].x);
    const height2 = Math.abs(shape.points[2].y - shape.points[0].y);
    height = Math.max(width, height2);
  }

  const triangles = extrude(shape.points, height);
  const geometry = new THREE.BufferGeometry();
  const vertices: number[] = [];

  triangles.forEach((tri) => {
    tri.forEach((v) => {
      vertices.push(v.x, v.y, v.z);
    });
  });

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );
  geometry.computeVertexNormals();
  geometry.center();

  const material = new THREE.MeshNormalMaterial({
    side: THREE.DoubleSide,
  });

  return new THREE.Mesh(geometry, material);
}
