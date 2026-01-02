export function calculateTrustworthiness(
  originalData: number[][],
  embeddedData: number[][],
  k: number = 12
): number {
  const n = originalData.length;
  if (n === 0 || embeddedData.length !== n) return 0;

  let trustworthiness = 0;

  for (let i = 0; i < n; i++) {
    const originalNeighbors = findKNearestNeighbors(originalData, i, k);
    const embeddedNeighbors = findKNearestNeighbors(embeddedData, i, k);

    for (const embeddedNeighbor of embeddedNeighbors) {
      if (!originalNeighbors.includes(embeddedNeighbor)) {
        const rankInOriginal = getRankInOriginalSpace(
          originalData,
          i,
          embeddedNeighbor
        );
        if (rankInOriginal > k) {
          trustworthiness += rankInOriginal - k;
        }
      }
    }
  }

  return 1 - (2 / (n * k * (2 * n - 3 * k - 1))) * trustworthiness;
}

function findKNearestNeighbors(
  data: number[][],
  pointIndex: number,
  k: number
): number[] {
  const distances: { index: number; distance: number }[] = [];
  const point = data[pointIndex];

  for (let i = 0; i < data.length; i++) {
    if (i === pointIndex) continue;

    const distance = euclideanDistance(point, data[i]);
    distances.push({ index: i, distance });
  }

  distances.sort((a, b) => a.distance - b.distance);
  return distances.slice(0, k).map((d) => d.index);
}

function getRankInOriginalSpace(
  data: number[][],
  pointIndex: number,
  targetIndex: number
): number {
  const distances: { index: number; distance: number }[] = [];
  const point = data[pointIndex];

  for (let i = 0; i < data.length; i++) {
    if (i === pointIndex) continue;

    const distance = euclideanDistance(point, data[i]);
    distances.push({ index: i, distance });
  }

  distances.sort((a, b) => a.distance - b.distance);

  for (let i = 0; i < distances.length; i++) {
    if (distances[i].index === targetIndex) {
      return i + 1;
    }
  }

  return distances.length + 1;
}

function euclideanDistance(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += (a[i] - b[i]) ** 2;
  }
  return Math.sqrt(sum);
}

export function calculateStress(
  originalData: number[][],
  embeddedData: number[][]
): number {
  const n = originalData.length;
  if (n === 0 || embeddedData.length !== n) return Infinity;

  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const originalDist = euclideanDistance(originalData[i], originalData[j]);
      const embeddedDist = euclideanDistance(embeddedData[i], embeddedData[j]);

      numerator += (originalDist - embeddedDist) ** 2;
      denominator += originalDist ** 2;
    }
  }

  return denominator > 0 ? Math.sqrt(numerator / denominator) : Infinity;
}
