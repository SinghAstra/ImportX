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

    const flowNodes = data.nodes.map((node) => ({
      id: node.id,
      position: { x: Math.random() * 800, y: Math.random() * 600 },
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
      <div className="h-[600px] w-full flex items-center justify-center border rounded-lg">
        Loading graph data...
      </div>
    );

  if (error)
    return (
      <div className="text-red-500">Error loading graph: {error.message}</div>
    );

  return (
    <div className="h-[600px] w-full border rounded-lg overflow-hidden bg-slate-50">
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
