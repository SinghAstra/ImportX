import { z } from "zod";

export const graphNodeSchema = z.object({
  id: z.string().uuid(),
  filePath: z.string(),
  isExternal: z.boolean(),
});

export const graphEdgeSchema = z.object({
  id: z.string().uuid(),
  sourceId: z.string().uuid(),
  targetId: z.string().uuid(),
  type: z.string(),
});

export const getGraphResponseSchema = z.object({
  nodes: z.array(graphNodeSchema),
  edges: z.array(graphEdgeSchema),
});

export type GraphNodeData = z.infer<typeof graphNodeSchema>;

export type GraphEdgeData = z.infer<typeof graphEdgeSchema>;

export type GetGraphResponse = z.infer<typeof getGraphResponseSchema>;
