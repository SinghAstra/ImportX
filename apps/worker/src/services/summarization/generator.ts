import { MODEL_CONFIG } from "../../ai/model-config";
import { executeAIRequest } from "../../ai/request-manager";
import { SYSTEM_PROMPT } from "./prompts";

export async function summarizeDirectly(
  runId: number,
  relativePath: string,
  content: string
): Promise<string> {
  console.log(`🤖 [Generator] Generating direct summary for: ${relativePath}`);

  const aiResponse = await executeAIRequest(runId, {
    model: MODEL_CONFIG.activeModel,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Explain why this file exists and its primary responsibility:\n\nPath: ${relativePath}\n\nContent:\n${content}`,
      },
    ],
  });

  return (
    aiResponse?.choices[0]?.message?.content?.trim() || "No summary written."
  );
}

export async function summarizeChunked(
  runId: number,
  relativePath: string,
  content: string
): Promise<string> {
  const targetChunkSize = Math.floor(MODEL_CONFIG.maxInputTokens * 3.2);

  const lines = content.split("\n");

  const chunks: string[] = [];

  let currentChunk = "";

  for (const line of lines) {
    if ((currentChunk + "\n" + line).length > targetChunkSize) {
      if (currentChunk) chunks.push(currentChunk);

      currentChunk = line;
    } else {
      currentChunk = currentChunk ? currentChunk + "\n" + line : line;
    }
  }

  if (currentChunk) chunks.push(currentChunk);

  const totalOriginalChunks = chunks.length;

  const isTruncated = totalOriginalChunks > 2;

  const chunksToProcess = isTruncated ? chunks.slice(0, 2) : chunks;

  console.log(
    `🧩 [Generator] [Run ${runId}] File: ${relativePath} split into ${totalOriginalChunks} chunks. Processing ${chunksToProcess.length} (Truncated: ${isTruncated})`
  );

  const intermediateSummaries: string[] = [];

  for (let i = 0; i < chunksToProcess.length; i++) {
    const chunkResponse = await executeAIRequest(runId, {
      model: MODEL_CONFIG.activeModel,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Summary step (${i + 1}/${chunksToProcess.length}) for "${relativePath}":\n\nCode:\n${chunksToProcess[i]}`,
        },
      ],
    });

    const partialText = chunkResponse?.choices[0]?.message?.content?.trim();

    if (partialText) intermediateSummaries.push(partialText);
  }

  const unifiedPayload = intermediateSummaries
    .map((s, idx) => `Segment ${idx + 1} Summary: ${s}`)
    .join("\n\n");

  const reductionResponse = await executeAIRequest(runId, {
    model: MODEL_CONFIG.activeModel,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Synthesize these partial summaries into one cohesive overview explaining why "${relativePath}" exists and its overall responsibility:\n\n${unifiedPayload}`,
      },
    ],
  });

  let finalSummary =
    reductionResponse?.choices[0]?.message?.content?.trim() ||
    "Failed synthesizing fragmented summaries.";

  if (isTruncated) {
    finalSummary += ` Note: This summary was derived from the initial sections of this large file layout.`;
  }

  return finalSummary;
}
