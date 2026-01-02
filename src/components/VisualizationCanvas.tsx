import Plot from "react-plotly.js";

interface VisualizationCanvasProps {
  data: number[][];
  clusters?: number[];
  edges?: Array<[number, number]>;
  width?: number;
  height?: number;
}

const CLUSTER_COLORS = [
  "#e6194b",
  "#3cb44b",
  "#ffe119",
  "#4363d8",
  "#f58231",
  "#911eb4",
  "#46f0f0",
  "#f032e6",
  "#bcf60c",
  "#fabebe",
  "#008080",
  "#e6beff",
  "#9a6324",
  "#fffac8",
  "#800000",
  "#aaffc3",
  "#808000",
  "#ffd8b1",
  "#000075",
  "#808080",
];

export const VisualizationCanvas: React.FC<VisualizationCanvasProps> = ({
  data,
  clusters,
  edges,
  width = 700,
  height = 500,
}) => {
  const nodeColors = clusters
    ? clusters.map((c) => CLUSTER_COLORS[c % CLUSTER_COLORS.length])
    : Array(data.length).fill("#3498db");

  let edgeTraces: Record<string, any>[] = [];
  if (edges && edges.length > 0) {
    edgeTraces = edges.map(([i, j]) => {
      const c = clusters ? clusters[i] : 0;
      return {
        x: [data[i][0], data[j][0]],
        y: [data[i][1], data[j][1]],
        z: [data[i][2] ?? 0, data[j][2] ?? 0],
        mode: "lines",
        line: {
          color: CLUSTER_COLORS[c % CLUSTER_COLORS.length],
          width: 2,
        },
        type: "scatter3d",
        hoverinfo: "none",
        showlegend: false,
      };
    });
  }

  const nodeTrace = {
    x: data.map((p) => p[0]),
    y: data.map((p) => p[1]),
    z: data.map((p) => p[2] ?? 0),
    mode: "markers",
    marker: {
      color: nodeColors,
      size: 6,
      line: { width: 1, color: "#222" },
    },
    type: "scatter3d",
    text: clusters ? clusters.map((c) => `Cluster ${c}`) : undefined,
    hoverinfo: "text",
    name: "Nodes",
  };

  return (
    <Plot
      data={[...edgeTraces, nodeTrace]}
      layout={{
        width,
        height,
        margin: { l: 0, r: 0, b: 0, t: 0 },
        scene: {
          xaxis: { title: "X", showgrid: false },
          yaxis: { title: "Y", showgrid: false },
          zaxis: { title: "Z", showgrid: false },
        },
        showlegend: false,
      }}
      config={{ responsive: true }}
    />
  );
};
