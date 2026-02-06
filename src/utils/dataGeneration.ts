import type { DatasetConfig } from "@/types/benchmark";

export interface ClusteredDataset {
  data: number[][];
  clusters: number[];
  edges: Array<[number, number]>;
}

export const generateRandomData = (
  size: number,
  dimensions: number
): number[][] => {
  const data: number[][] = [];
  for (let i = 0; i < size; i++) {
    const point: number[] = [];
    for (let j = 0; j < dimensions; j++) {
      point.push(Math.random() * 10 - 5);
    }
    data.push(point);
  }
  return data;
};

export const generate3DClusteredData = (
  size: number,
  numClusters: number = 4
): ClusteredDataset => {
  const data: number[][] = [];
  const clusters: number[] = [];
  const edges: Array<[number, number]> = [];

  const clusterCenters: Array<[number, number, number]> = [];
  for (let i = 0; i < numClusters; i++) {
    clusterCenters.push([
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20,
    ]);
  }

  for (let i = 0; i < size; i++) {
    const clusterIndex = Math.floor(Math.random() * numClusters);
    const center = clusterCenters[clusterIndex];

    const point = [
      center[0] + (Math.random() - 0.5) * 4,
      center[1] + (Math.random() - 0.5) * 4,
      center[2] + (Math.random() - 0.5) * 4,
    ];

    data.push(point);
    clusters.push(clusterIndex);
  }

  for (let i = 0; i < size; i++) {
    for (let j = i + 1; j < size; j++) {
      if (clusters[i] === clusters[j]) {
        const dist = euclideanDistance3D(data[i], data[j]);
        if (dist < 3) {
          edges.push([i, j]);
        }
      }
    }
  }

  return { data, clusters, edges };
};

const euclideanDistance3D = (p1: number[], p2: number[]): number => {
  const dx = p1[0] - p2[0];
  const dy = p1[1] - p2[1];
  const dz = (p1[2] || 0) - (p2[2] || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

export const generateClusteredData = (
  size: number,
  dimensions: number
): number[][] => {
  const data: number[][] = [];
  const numClusters = Math.min(5, Math.ceil(size / 100));
  const clusterCenters: number[][] = [];

  for (let i = 0; i < numClusters; i++) {
    const center: number[] = [];
    for (let j = 0; j < dimensions; j++) {
      center.push(Math.random() * 20 - 10);
    }
    clusterCenters.push(center);
  }

  for (let i = 0; i < size; i++) {
    const clusterIndex = Math.floor(Math.random() * numClusters);
    const center = clusterCenters[clusterIndex];
    const point: number[] = [];

    for (let j = 0; j < dimensions; j++) {
      point.push(center[j] + (Math.random() - 0.5) * 2);
    }
    data.push(point);
  }
  return data;
};

export const generate3DSphericalClusters = (
  size: number,
  numClusters: number = 3
): ClusteredDataset => {
  const data: number[][] = [];
  const clusters: number[] = [];
  const edges: Array<[number, number]> = [];

  const allCenters: Array<[number, number, number]> = [
    [-8, -8, -8],
    [8, 8, 8],
    [0, 12, -5],
    [-10, 5, 10],
    [15, -8, 2],
  ];
  const clusterCenters = allCenters.slice(0, numClusters);

  for (let i = 0; i < size; i++) {
    const clusterIndex = Math.floor(Math.random() * numClusters);
    const center = clusterCenters[clusterIndex];

    const radius = 1 + Math.random() * 2;
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.random() * Math.PI;

    const point = [
      center[0] + radius * Math.sin(phi) * Math.cos(theta),
      center[1] + radius * Math.sin(phi) * Math.sin(theta),
      center[2] + radius * Math.cos(phi),
    ];

    data.push(point);
    clusters.push(clusterIndex);
  }

  for (let i = 0; i < size; i++) {
    for (let j = i + 1; j < Math.min(i + 10, size); j++) {
      if (clusters[i] === clusters[j]) {
        const dist = euclideanDistance3D(data[i], data[j]);
        if (dist < 2.5) {
          edges.push([i, j]);
        }
      }
    }
  }

  return { data, clusters, edges };
};

export const generate3DHelixClusters = (size: number): ClusteredDataset => {
  const data: number[][] = [];
  const clusters: number[] = [];
  const edges: Array<[number, number]> = [];

  const numHelixes = 3;

  for (let i = 0; i < size; i++) {
    const helixIndex = Math.floor(Math.random() * numHelixes);
    const t =
      (i / size) * 8 * Math.PI + helixIndex * ((2 * Math.PI) / numHelixes);
    const radius = 5 + helixIndex * 2;

    const point = [
      radius * Math.cos(t) + (Math.random() - 0.5) * 0.5,
      radius * Math.sin(t) + (Math.random() - 0.5) * 0.5,
      t * 2 + (Math.random() - 0.5) * 1,
    ];

    data.push(point);
    clusters.push(helixIndex);
  }

  for (let i = 0; i < size - 1; i++) {
    if (clusters[i] === clusters[i + 1] && Math.random() > 0.3) {
      edges.push([i, i + 1]);
    }
  }

  return { data, clusters, edges };
};

export const generateIrisDataset = (): ClusteredDataset => {
  const irisData = [
    ...Array.from({ length: 50 }, () => [
      4.8 + Math.random() * 1.0,
      3.0 + Math.random() * 0.8,
      1.3 + Math.random() * 0.6,
      0.1 + Math.random() * 0.5,
    ]),
    ...Array.from({ length: 50 }, () => [
      5.9 + Math.random() * 1.0,
      2.7 + Math.random() * 0.6,
      3.8 + Math.random() * 1.0,
      1.2 + Math.random() * 0.6,
    ]),
    ...Array.from({ length: 50 }, () => [
      6.3 + Math.random() * 1.2,
      2.8 + Math.random() * 0.6,
      5.1 + Math.random() * 1.8,
      1.8 + Math.random() * 0.7,
    ]),
  ];

  const clusters = [
    ...Array(50).fill(0),
    ...Array(50).fill(1),
    ...Array(50).fill(2),
  ];

  const edges: Array<[number, number]> = [];
  for (let i = 0; i < irisData.length; i++) {
    for (let j = i + 1; j < Math.min(i + 5, irisData.length); j++) {
      if (clusters[i] === clusters[j]) {
        const dist = euclideanDistance(irisData[i], irisData[j]);
        if (dist < 1.0) {
          edges.push([i, j]);
        }
      }
    }
  }

  return { data: irisData, clusters, edges };
};

export const generateWineDataset = (): ClusteredDataset => {
  const wineData: number[][] = [];
  const clusters: number[] = [];

  for (let i = 0; i < 59; i++) {
    wineData.push([
      13.2 + Math.random() * 1.5,
      2.8 + Math.random() * 0.8,
      2.4 + Math.random() * 0.4,
      19.5 + Math.random() * 3.0,
      106 + Math.random() * 20,
      2.8 + Math.random() * 0.6,
      3.0 + Math.random() * 0.8,
      0.3 + Math.random() * 0.2,
      2.0 + Math.random() * 0.4,
      5.6 + Math.random() * 2.0,
      1.0 + Math.random() * 0.4,
      3.2 + Math.random() * 0.6,
      1150 + Math.random() * 200,
    ]);
    clusters.push(0);
  }

  for (let i = 0; i < 71; i++) {
    wineData.push([
      12.3 + Math.random() * 1.0,
      1.9 + Math.random() * 0.8,
      2.2 + Math.random() * 0.3,
      20.0 + Math.random() * 2.5,
      94 + Math.random() * 25,
      2.2 + Math.random() * 0.7,
      2.0 + Math.random() * 0.9,
      0.35 + Math.random() * 0.15,
      1.6 + Math.random() * 0.5,
      3.0 + Math.random() * 1.5,
      1.0 + Math.random() * 0.3,
      2.7 + Math.random() * 0.5,
      520 + Math.random() * 150,
    ]);
    clusters.push(1);
  }

  for (let i = 0; i < 48; i++) {
    wineData.push([
      12.8 + Math.random() * 1.2,
      2.9 + Math.random() * 1.0,
      2.4 + Math.random() * 0.4,
      21.0 + Math.random() * 2.0,
      99 + Math.random() * 15,
      1.8 + Math.random() * 0.5,
      0.8 + Math.random() * 0.6,
      0.45 + Math.random() * 0.15,
      1.2 + Math.random() * 0.4,
      2.2 + Math.random() * 1.8,
      0.84 + Math.random() * 0.2,
      2.2 + Math.random() * 0.4,
      630 + Math.random() * 120,
    ]);
    clusters.push(2);
  }

  const edges: Array<[number, number]> = [];
  for (let i = 0; i < wineData.length; i++) {
    for (let j = i + 1; j < Math.min(i + 8, wineData.length); j++) {
      if (clusters[i] === clusters[j]) {
        const dist = euclideanDistance(wineData[i], wineData[j]);
        if (dist < 50) {
          edges.push([i, j]);
        }
      }
    }
  }

  return { data: wineData, clusters, edges };
};

export const generateSwissRoll = (size: number): ClusteredDataset => {
  const data: number[][] = [];
  const clusters: number[] = [];
  const edges: Array<[number, number]> = [];

  for (let i = 0; i < size; i++) {
    const t = 3 * Math.PI * (1 + 2 * Math.random());
    const y = 21 * Math.random();

    const x = t * Math.cos(t);
    const z = t * Math.sin(t);

    data.push([x, y, z]);

    clusters.push(Math.floor(t / Math.PI) % 6);
  }

  for (let i = 0; i < size - 1; i++) {
    for (let j = i + 1; j < Math.min(i + 10, size); j++) {
      const dist = euclideanDistance3D(data[i], data[j]);
      if (dist < 15 && Math.random() > 0.7) {
        edges.push([i, j]);
      }
    }
  }

  return { data, clusters, edges };
};

export const generateMNISTLike = (size: number): ClusteredDataset => {
  const data: number[][] = [];
  const clusters: number[] = [];
  const edges: Array<[number, number]> = [];

  for (let i = 0; i < size; i++) {
    const digit = Math.floor(Math.random() * 10);

    const features: number[] = [];

    for (let pixel = 0; pixel < 784; pixel++) {
      const row = Math.floor(pixel / 28);
      const col = pixel % 28;

      const distFromCenter = Math.sqrt(
        Math.pow(row - 14, 2) + Math.pow(col - 14, 2)
      );

      let value = 0;
      if (distFromCenter < 8 + Math.random() * 4) {
        value = Math.random() * 0.8 + 0.2;
      } else {
        value = Math.random() * 0.2;
      }

      features.push(value);
    }

    data.push(features);
    clusters.push(digit);
  }

  for (let i = 0; i < Math.min(size, 1000); i++) {
    for (let j = i + 1; j < Math.min(i + 5, size); j++) {
      if (clusters[i] === clusters[j]) {
        edges.push([i, j]);
      }
    }
  }

  return { data, clusters, edges };
};

const euclideanDistance = (p1: number[], p2: number[]): number => {
  return Math.sqrt(
    p1.reduce((sum, val, idx) => sum + Math.pow(val - p2[idx], 2), 0)
  );
};

export const generateSpiralData = (
  size: number,
  dimensions: number
): number[][] => {
  const data: number[][] = [];
  for (let i = 0; i < size; i++) {
    const t = (i / size) * 4 * Math.PI;
    const r = t / (4 * Math.PI);
    const point: number[] = [r * Math.cos(t), r * Math.sin(t)];

    for (let j = 2; j < dimensions; j++) {
      point.push(Math.random() * 0.5 - 0.25);
    }
    data.push(point);
  }
  return data;
};

export const DATASET_CONFIGS: DatasetConfig[] = [
  {
    name: "Iris Dataset (150 points, 4D)",
    size: 150,
    dimensions: 4,
    generator: () => {
      const { data } = generateIrisDataset();
      return data;
    },
  },
  {
    name: "Wine Dataset (178 points, 13D)",
    size: 178,
    dimensions: 13,
    generator: () => {
      const { data } = generateWineDataset();
      return data;
    },
  },
  {
    name: "Swiss Roll (600 points, 3D manifold)",
    size: 600,
    dimensions: 3,
    generator: () => {
      const { data } = generateSwissRoll(600);
      return data;
    },
  },
  {
    name: "Small Random (80 points)",
    size: 80,
    dimensions: 10,
    generator: () => generateRandomData(80, 10),
  },
  {
    name: "3D Spherical Clusters (300 points)",
    size: 300,
    dimensions: 50,
    generator: () => {
      const { data } = generate3DSphericalClusters(300, 4);
      return data.map((point) => [
        ...point,
        ...Array.from({ length: 47 }, () => Math.random() * 0.1 - 0.05),
      ]);
    },
  },
  {
    name: "3D Helix Clusters (400 points)",
    size: 400,
    dimensions: 30,
    generator: () => {
      const { data } = generate3DHelixClusters(400);
      return data.map((point) => [
        ...point,
        ...Array.from({ length: 27 }, () => Math.random() * 0.1 - 0.05),
      ]);
    },
  },
  {
    name: "Medium Clustered (600 points)",
    size: 600,
    dimensions: 50,
    generator: () => generateClusteredData(600, 50),
  },
  {
    name: "MNIST-like (1K points, 784D)",
    size: 1000,
    dimensions: 784,
    generator: () => {
      const { data } = generateMNISTLike(1000);
      return data;
    },
  },
  {
    name: "3D Dense Clusters (1K points)",
    size: 1000,
    dimensions: 75,
    generator: () => {
      const { data } = generate3DClusteredData(1000, 5);
      return data.map((point) => [
        ...point,
        ...Array.from({ length: 72 }, () => Math.random() * 0.1 - 0.05),
      ]);
    },
  },
  {
    name: "Spiral (1K points)",
    size: 1000,
    dimensions: 20,
    generator: () => generateSpiralData(1000, 20),
  },
  {
    name: "Large Swiss Roll (2K points)",
    size: 2000,
    dimensions: 3,
    generator: () => {
      const { data } = generateSwissRoll(2000);
      return data;
    },
  },
  {
    name: "Large Clustered (5K points, 100D)",
    size: 5000,
    dimensions: 100,
    generator: () => generateClusteredData(5000, 100),
  },
  {
    name: "Very Large Random (10K points, 50D)",
    size: 10000,
    dimensions: 50,
    generator: () => generateRandomData(10000, 50),
  },
  {
    name: "MNIST-scale (10K points, 784D)",
    size: 10000,
    dimensions: 784,
    generator: () => {
      const { data } = generateMNISTLike(10000);
      return data;
    },
  },
];
