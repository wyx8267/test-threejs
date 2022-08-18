import * as Three from "three";

interface VoxelFace {
  uvRow: number;
  dir: number[];
  corners: { pos: number[]; uv: number[] }[];
}

interface VoxelOptions {
  cellSize: number;
  tileSize: number;
  tileTextureWidth: number;
  tileTextureHeight: number;
}

class Voxelworld {
  static faces: VoxelFace[];
  cellSize: number;
  cells: Record<string, any>;
  cellSliceSize: number;
  tileSize: number;
  tileTextureWidth: number;
  tileTextureHeight: number;

  constructor(options: VoxelOptions) {
    this.cellSize = options.cellSize;
    this.tileSize = options.tileSize;
    this.tileTextureWidth = options.tileTextureWidth;
    this.tileTextureHeight = options.tileTextureHeight;
    const { cellSize } = this;
    this.cellSliceSize = cellSize * cellSize;
    // this.cell = new Uint8Array(cellSize * cellSize * cellSize);
    this.cells = {}
  }

  computedCellId(x: number, y: number, z: number) {
    const { cellSize } = this;
    const cellX = Math.floor(x / cellSize);
    const cellY = Math.floor(y / cellSize);
    const cellZ = Math.floor(z / cellSize);
    return `${cellX},${cellY},${cellZ}`;
  }

  getCellForVoxel(x: number, y: number, z: number) {
    return this.cells[this.computedCellId(x, y, z)]
  }

  computedVoxelOffset(x: number, y: number, z: number) {
    const { cellSize, cellSliceSize } = this;
    const voxelX = Three.MathUtils.euclideanModulo(x, cellSize) | 0;
    const voxelY = Three.MathUtils.euclideanModulo(y, cellSize) | 0;
    const voxelZ = Three.MathUtils.euclideanModulo(z, cellSize) | 0;
    return voxelY * cellSliceSize + voxelZ * cellSize + voxelX;
  }

  getVoxel(x: number, y: number, z: number) {
    const cell = this.getCellForVoxel(x, y, z);
    if (!cell) {
      return 0;
    }
    const voxelOffset = this.computedVoxelOffset(x, y, z);
    return cell[voxelOffset];
  }

  setVoxel(x: number, y: number, z: number, v: number) {
    let cell = this.getCellForVoxel(x, y, z);
    if (!cell) {
      cell = this.addCellForVoxel(x, y, z)
    }
    const voxelOffset = this.computedVoxelOffset(x, y, z);
    cell[voxelOffset] = v;
  }

  addCellForVoxel(x: number, y: number, z: number) {
    const cellId = this.computedCellId(x, y, z)
    let cell = this.cells[cellId]
    if (!cell) {
      const { cellSize } = this;
      cell = new Uint8Array(cellSize * cellSize * cellSize)
      this.cells[cellId] = cell
    }
    return cell
  }

  generateGeometryDataForCell(cellX: number, cellY: number, cellZ: number) {
    const { cellSize, tileSize, tileTextureWidth, tileTextureHeight } = this;
    const positions = [];
    const normals = [];
    const uvs = [];
    const indices = [];
    const startX = cellX * cellSize;
    const startY = cellY * cellSize;
    const startZ = cellZ * cellSize;

    for (let y = 0; y < cellSize; ++y) {
      const voxelY = startY + y;
      for (let z = 0; z < cellSize; ++z) {
        const voxelZ = startZ + z;
        for (let x = 0; x < cellSize; ++x) {
          const voxelX = startX + x;
          const voxel = this.getVoxel(voxelX, voxelY, voxelZ);
          if (voxel) {
            const uvVoxel = voxel - 1;
            for (const { dir, corners, uvRow } of Voxelworld.faces) {
              const neighbor = this.getVoxel(
                voxelX + dir[0],
                voxelY + dir[1],
                voxelZ + dir[2]
              );
              if (!neighbor) {
                const ndx = positions.length / 3;
                for (const { pos, uv } of corners) {
                  positions.push(pos[0] + x, pos[1] + y, pos[2] + z);
                  normals.push(...dir);
                  uvs.push(
                    ((uvVoxel + uv[0]) * tileSize) / tileTextureWidth,
                    1 - ((uvRow + 1 - uv[1]) * tileSize) / tileTextureHeight
                  );
                }
                indices.push(ndx, ndx + 1, ndx + 2, ndx + 2, ndx + 1, ndx + 3);
              }
            }
          }
        }
      }
    }
    return {
      positions,
      normals,
      uvs,
      indices,
    };
  }
}

Voxelworld.faces = [
  {
    // left
    uvRow: 0,
    dir: [-1, 0, 0],
    corners: [
      { pos: [0, 1, 0], uv: [0, 1] },
      { pos: [0, 0, 0], uv: [0, 0] },
      { pos: [0, 1, 1], uv: [1, 1] },
      { pos: [0, 0, 1], uv: [1, 0] },
    ],
  },
  {
    // right
    uvRow: 0,
    dir: [1, 0, 0],
    corners: [
      { pos: [1, 1, 1], uv: [0, 1] },
      { pos: [1, 0, 1], uv: [0, 0] },
      { pos: [1, 1, 0], uv: [1, 1] },
      { pos: [1, 0, 0], uv: [1, 0] },
    ],
  },
  {
    // bottom
    uvRow: 1,
    dir: [0, -1, 0],
    corners: [
      { pos: [1, 0, 1], uv: [1, 0] },
      { pos: [0, 0, 1], uv: [0, 0] },
      { pos: [1, 0, 0], uv: [1, 1] },
      { pos: [0, 0, 0], uv: [0, 1] },
    ],
  },
  {
    // top
    uvRow: 2,
    dir: [0, 1, 0],
    corners: [
      { pos: [0, 1, 1], uv: [1, 1] },
      { pos: [1, 1, 1], uv: [0, 1] },
      { pos: [0, 1, 0], uv: [1, 0] },
      { pos: [1, 1, 0], uv: [0, 0] },
    ],
  },
  {
    // back
    uvRow: 0,
    dir: [0, 0, -1],
    corners: [
      { pos: [1, 0, 0], uv: [0, 0] },
      { pos: [0, 0, 0], uv: [1, 0] },
      { pos: [1, 1, 0], uv: [0, 1] },
      { pos: [0, 1, 0], uv: [1, 1] },
    ],
  },
  {
    // front
    uvRow: 0,
    dir: [0, 0, 1],
    corners: [
      { pos: [0, 0, 1], uv: [0, 0] },
      { pos: [1, 0, 1], uv: [1, 0] },
      { pos: [0, 1, 1], uv: [0, 1] },
      { pos: [1, 1, 1], uv: [1, 1] },
    ],
  },
];

export default Voxelworld;
