import React, { useRef, useEffect, useState } from "react";
import "./App.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import {
  createSquare,
  createRectangle,
  createCircle,
  resizeSquare,
  resizeRectangle,
  resizeCircle,
  Shape2D,
  Point,
} from "../features/shape-editor/geometry/shapes2D";

import { create3DShape } from "../features/shape-editor/rendering/create3DShape";
import {
  quadToTriangles,
  circleToTriangles,
  extrude,
  sphereToTriangles,
} from "../features/shape-editor/geometry/triangulation";
import { trianglesToSTL } from "../features/shape-editor/export/trianglesToSTL";

function App() {
  const TOP_MENU_HEIGHT = 72;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);

  const [mode, setMode] = useState<"2D" | "3D">("2D");
  const [shapeType, setShapeType] = useState("square");

  const [shape, setShape] = useState<Shape2D | null>(null);
  const [start, setStart] = useState<Point | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    if (!isLocked) return;
    setStart(null);
    setDragIndex(null);
  }, [isLocked]);

  useEffect(() => {
    if (mode !== "2D") return;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!shape) return;

    if (shape.type !== "circle") {
      const triangles = quadToTriangles(shape.points);

      triangles.forEach((tri) => {
        ctx.beginPath();
        ctx.moveTo(tri[0].x, tri[0].y);
        ctx.lineTo(tri[1].x, tri[1].y);
        ctx.lineTo(tri[2].x, tri[2].y);
        ctx.closePath();

        ctx.fillStyle = "rgba(255,255,0,0.3)";
        ctx.fill();
      });

      ctx.beginPath();
      ctx.moveTo(shape.points[0].x, shape.points[0].y);
      for (let i = 1; i < shape.points.length; i++) {
        ctx.lineTo(shape.points[i].x, shape.points[i].y);
      }
      ctx.closePath();
      ctx.strokeStyle = "yellow";
      ctx.stroke();

      shape.points.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = "orange";
        ctx.fill();
      });
    }

    if (shape.type === "circle") {
      const triangles = circleToTriangles(shape.center, shape.radius);

      triangles.forEach((tri) => {
        ctx.beginPath();
        ctx.moveTo(tri[0].x, tri[0].y);
        ctx.lineTo(tri[1].x, tri[1].y);
        ctx.lineTo(tri[2].x, tri[2].y);
        ctx.closePath();

        ctx.fillStyle = "rgba(0,255,255,0.3)";
        ctx.fill();
      });
    }
  }, [shape, mode]);

  useEffect(() => {
    if (mode !== "3D" || !shape) return;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / (window.innerHeight - TOP_MENU_HEIGHT),
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight - TOP_MENU_HEIGHT);

    mountRef.current!.innerHTML = "";
    mountRef.current!.appendChild(renderer.domElement);

    const mesh = create3DShape(shape);
    scene.add(mesh);

    camera.position.z = 500;
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    let animationFrameId = 0;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      renderer.dispose();
    };
  }, [mode, shape]);

  const getPoint = (e: React.MouseEvent): Point => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isLocked) return;
    const p = getPoint(e);

    if (shape && shape.type !== "circle") {
      for (let i = 0; i < shape.points.length; i++) {
        const pt = shape.points[i];
        if (Math.hypot(pt.x - p.x, pt.y - p.y) < 10) {
          setDragIndex(i);
          return;
        }
      }
    }

    setStart(p);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isLocked) return;
    const p = getPoint(e);

    if (dragIndex !== null && shape) {
      let updated;

      if (shape.type === "square") updated = resizeSquare(shape, dragIndex, p);
      else if (shape.type === "rectangle")
        updated = resizeRectangle(shape, dragIndex, p);
      else if (shape.type === "circle") updated = resizeCircle(shape, p);

      setShape(updated!);
      return;
    }

    if (!start) return;

    let newShape;

    if (shapeType === "square") newShape = createSquare(start, p);
    else if (shapeType === "rectangle") newShape = createRectangle(start, p);
    else if (shapeType === "circle") newShape = createCircle(start, p);

    setShape(newShape!);
  };

  const handleMouseUp = () => {
    if (isLocked) return;
    setStart(null);
    setDragIndex(null);
  };

  const handleExport = () => {
    if (!shape) return;

    const triangles =
      shape.type === "circle"
        ? sphereToTriangles(shape.center, shape.radius)
        : extrude(shape.points, 50);
    const stl = trianglesToSTL(triangles);

    const blob = new Blob([stl], { type: "text/plain" });
    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = "shape.stl";
    link.click();
  };

  return (
    <div className="app">
      <div className="top-menu">
        <div className="menu-group">
          <button onClick={() => setShapeType("square")}>Square</button>
          <button onClick={() => setShapeType("rectangle")}>Rectangle</button>
          <button onClick={() => setShapeType("circle")}>Circle</button>
        </div>

        <div className="menu-group">
          <button onClick={() => setMode("2D")}>2D</button>
          <button onClick={() => setMode("3D")}>3D</button>
        </div>

        <button onClick={() => setIsLocked((prev) => !prev)}>
          {isLocked ? "Unlock Edit" : "Lock Edit"}
        </button>

        <button className="export-btn" onClick={handleExport}>
          Export STL
        </button>
      </div>

      <div className="workspace">
        {mode === "2D" && (
          <canvas
            ref={canvasRef}
            width={window.innerWidth}
            height={window.innerHeight - TOP_MENU_HEIGHT}
            className="canvas"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          />
        )}

        {mode === "3D" && <div ref={mountRef} className="viewer-3d" />}
      </div>
    </div>
  );
}

export default App;
