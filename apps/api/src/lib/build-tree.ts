import { RepositoryFile } from "@prisma/client";
import { FileSummaryStatus, RepositoryTreeNode } from "@repo/shared";

export function buildRepositoryTree(
  files: RepositoryFile[]
): RepositoryTreeNode[] {
  console.log(
    `📊 [Tree Builder] Starting compilation. Total raw records received: ${files.length}`
  );

  const root: RepositoryTreeNode = {
    name: "root",
    relativePath: "",
    type: "folder",
    children: [],
  };

  for (const file of files) {
    const normalizedPath = file.relativePath.replace(/\\/g, "/");

    const parts = normalizedPath.split("/");

    let currentElement = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];

      const isLastPart = i === parts.length - 1;

      const runningPath = parts.slice(0, i + 1).join("/");

      let targetNode = currentElement.children.find(
        (child) => child.name === part
      );

      if (!targetNode) {
        targetNode = {
          name: part,
          relativePath: runningPath,
          type: isLastPart ? "file" : "folder",
          ...(isLastPart && {
            fileId: file.id,
            extension: file.extension,
            size: file.size,
            summaryStatus: file.summaryStatus as FileSummaryStatus,
            summary: file.summary,
          }),
          children: [],
        };

        (currentElement.children as RepositoryTreeNode[]).push(targetNode);
      }

      currentElement = targetNode;
    }
  }

  const sortTreeNodes = (nodes: RepositoryTreeNode[]): RepositoryTreeNode[] => {
    return nodes
      .map((node) => ({
        ...node,
        children: node.children.length > 0 ? sortTreeNodes(node.children) : [],
      }))
      .sort((a, b) => {
        if (a.type !== b.type) return a.type === "folder" ? -1 : 1;

        return a.name.localeCompare(b.name);
      });
  };

  const finalTree = sortTreeNodes(root.children);

  return finalTree;
}
