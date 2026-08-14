import { z } from "zod";

export const graphNodeSchema = z.object({
  id: z.uuid(),
  filePath: z.string(),
  isExternal: z.boolean(),
});

export const graphEdgeSchema = z.object({
  id: z.uuid(),
  sourceId: z.uuid(),
  targetId: z.uuid(),
  type: z.string(),
});

export const getGraphResponseSchema = z.object({
  nodes: z.array(graphNodeSchema),
  edges: z.array(graphEdgeSchema),
});

export type GraphNodeData = z.infer<typeof graphNodeSchema>;

export type GraphEdgeData = z.infer<typeof graphEdgeSchema>;

export type GetGraphResponse = z.infer<typeof getGraphResponseSchema>;
