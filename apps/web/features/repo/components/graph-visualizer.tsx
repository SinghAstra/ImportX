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
      className: node.isExternal
        ? "bg-muted text-muted-foreground border-border rounded-lg shadow-none px-4 py-2 font-mono text-xs"
        : "bg-card text-card-foreground border-border rounded-lg shadow-sm px-4 py-2 font-mono text-xs",
    }));

    const flowEdges = data.edges.map((edge) => ({
      id: edge.id,
      source: edge.sourceId,
      target: edge.targetId,
      animated: true,
      // Swapped hsl to oklch to perfectly match your globals.css
      style: { stroke: "oklch(var(--muted-foreground) / 0.4)" },
    }));

    return { nodes: flowNodes, edges: flowEdges };
  }, [data]);

  if (isLoading)
    return (
      <div className="h-[600px] w-full flex items-center justify-center border rounded-lg bg-background text-muted-foreground">
        Loading graph data...
      </div>
    );

  if (error)
    return (
      <div className="h-[600px] w-full flex items-center justify-center border rounded-lg text-destructive">
        Error loading graph: {error.message}
      </div>
    );

  return (
    <div className="h-[600px] w-full border rounded-lg overflow-hidden bg-background">
      <ReactFlow nodes={nodes} edges={edges} fitView colorMode="dark">
        <Background />
        <Controls />
        <MiniMap zoomable pannable />
      </ReactFlow>
    </div>
  );
}
