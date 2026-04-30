export function trianglesToSTL(triangles: any[]) {
  let stl = "solid shape\n";

  triangles.forEach((tri) => {
    stl += "facet normal 0 0 0\nouter loop\n";

    tri.forEach((v) => {
      stl += `vertex ${v.x} ${v.y} ${v.z}\n`;
    });

    stl += "endloop\nendfacet\n";
  });

  stl += "endsolid shape";
  return stl;
}
