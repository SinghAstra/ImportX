"use client";

import { useMemo } from "react";
import { ReactFlow, Background, Controls, MiniMap } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useGetGraph } from "../hooks/use-get-graph";

interface GraphVisualizerProps {
  repositoryId: string;
}

export function GraphVisualizer({ repositoryId }: GraphVisualizerProps) {
  const { data, isLoading, error } = useGetGraph(repositoryId);

  const { nodes, edges } = useMemo(() => {
    if (!data) return { nodes: [], edges: [] };

    const flowNodes = data.nodes.map((node, index) => ({
      id: node.id,
      position: {
        x: (index * 137) % 800,
        y: (index * 211) % 600,
      },
      data: { label: node.filePath.split("/").pop() },
      style: {
        background: node.isExternal ? "#f3f4f6" : "#ffffff",
        border: "1px solid #d1d5db",
        borderRadius: "8px",
        padding: "10px",
      },
    }));

    const flowEdges = data.edges.map((edge) => ({
      id: edge.id,
      source: edge.sourceId,
      target: edge.targetId,
      animated: true,
    }));

    return { nodes: flowNodes, edges: flowEdges };
  }, [data]);

  if (isLoading)
    return (
      <div className="h-150 w-full flex items-center justify-center border rounded-lg">
        Loading graph data...
      </div>
    );

  if (error)
    return (
      <div className="text-red-500">Error loading graph: {error.message}</div>
    );

  return (
    <div className="h-150 w-full border rounded-lg overflow-hidden">
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
