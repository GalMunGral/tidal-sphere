import * as THREE from "three";
import { config } from "./config";

interface Point {
  pos: THREE.Vector3;
  neighbors: Set<Point>;
}

interface Source {
  obj: THREE.Object3D;
  axis: THREE.Vector3;
}

class Graph {
  private points: Point[] = [];
  private keys: number[] = [];
  private uniquePointIds: number[] = [];

  *uniquePoints(): Generator<Point> {
    for (const i of this.uniquePointIds) {
      yield this.points[i];
    }
  }

  get numPoints() {
    return this.points.length;
  }

  get numUniquePoints() {
    return this.uniquePointIds.length;
  }

  public getPoint(i: number): Point {
    return this.points[this.keys[i]];
  }

  public mergePoints() {
    this.keys = [0];
    this.uniquePointIds = [0];
    for (let i = 1; i < this.points.length; ++i) {
      this.keys[i] = i;
      for (let j = 0; j < i; ++j) {
        if (this.points[i].pos.distanceTo(this.points[j].pos) < 1e-5) {
          if (config.merge) {
            this.keys[i] = j;
          }
          break;
        }
      }
      if (this.keys[i] === i) {
        this.uniquePointIds.push(i);
      }
    }
  }

  public addPoint(point: Point) {
    this.points.push(point);
  }

  public addEdge(i: number, j: number) {
    this.points[this.keys[i]].neighbors.add(this.points[this.keys[j]]);
    this.points[this.keys[j]].neighbors.add(this.points[this.keys[i]]);
  }
}

export class World {
  geometry: THREE.BufferGeometry;
  surface: THREE.Mesh;
  wireframe: THREE.Mesh;
  graph: Graph = new Graph();
  sources: Source[] = [];

  constructor(radius: number, detail: number) {
    this.geometry = new THREE.IcosahedronGeometry(radius, detail);

    const position = this.geometry.attributes.position;
    const numPoints = position.array.length / 3;
    const numTriangles = numPoints / 3;

    for (let i = 0; i < numPoints; ++i) {
      const x = position.array[i * 3];
      const y = position.array[i * 3 + 1];
      const z = position.array[i * 3 + 2];
      this.graph.addPoint({
        pos: new THREE.Vector3(x, y, z),
        neighbors: new Set<Point>(),
      });
    }

    this.graph.mergePoints();

    for (let i = 0; i < numTriangles; ++i) {
      this.graph.addEdge(3 * i, 3 * i + 1);
      this.graph.addEdge(3 * i + 1, 3 * i + 2);
      this.graph.addEdge(3 * i + 2, 3 * i);
    }

    for (let i = 0; i < config.numSources; ++i) {
      const geometry = new THREE.SphereGeometry(0.1, 10, 10);
      const material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
      });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(
        -config.sourceRadius / 2 + Math.random() * config.sourceRadius,
        -config.sourceRadius / 2 + Math.random() * config.sourceRadius,
        -config.sourceRadius / 2 + Math.random() * config.sourceRadius
      );
      this.sources.push({
        obj: sphere,
        axis: new THREE.Vector3(
          Math.random(),
          Math.random(),
          Math.random()
        ).normalize(),
      });
    }

    this.surface = new THREE.Mesh(
      this.geometry,
      new THREE.MeshStandardMaterial({
        color: 0x00ffff,
        metalness: 0.5,
        roughness: 0,
        opacity: 0.8,
        transparent: true,
      })
    );

    this.wireframe = new THREE.Mesh(
      this.geometry,
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        wireframe: true,
      })
    );
  }

  public addToScene(scene: THREE.Scene) {
    scene.add(this.surface);
    scene.add(this.wireframe);
    for (const source of this.sources) {
      scene.add(source.obj);
    }
  }

  public update() {
    const positions = this.geometry.attributes.position;
    const normals = this.geometry.attributes.normal;

    for (let i = 0; i < this.graph.numPoints; ++i) {
      positions.array[i * 3] = this.graph.getPoint(i).pos.x;
      positions.array[i * 3 + 1] = this.graph.getPoint(i).pos.y;
      positions.array[i * 3 + 2] = this.graph.getPoint(i).pos.z;
    }
    this.geometry.computeVertexNormals();

    positions.needsUpdate = true;
    normals.needsUpdate = true;
  }
}
