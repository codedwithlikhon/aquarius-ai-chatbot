import { z } from "zod";
import { documentHandlersByArtifactKind } from "@/lib/artifacts/server";
import { getDocumentById } from "@/lib/db/queries";
import type { Plugin } from "../types";

export const updateDocumentPlugin: Plugin = ({ session, dataStream }) => ({
  name: "updateDocument",
  description: "Update a document with the given description.",
  inputSchema: z.object({
    id: z.string().describe("The ID of the document to update"),
    description: z
      .string()
      .describe("The description of changes that need to be made"),
  }),
  execute: async ({ id, description }) => {
    const document = await getDocumentById({ id });

    if (!document) {
      return {
        error: "Document not found",
      };
    }

    dataStream.write({
      type: "data-clear",
      data: null,
      transient: true,
    });

    const documentHandler = documentHandlersByArtifactKind.find(
      (documentHandlerByArtifactKind) =>
        documentHandlerByArtifactKind.kind === document.kind
    );

    if (!documentHandler) {
      throw new Error(`No document handler found for kind: ${document.kind}`);
    }

    await documentHandler.onUpdateDocument({
      document,
      description,
      dataStream,
      session,
    });

    dataStream.write({ type: "data-finish", data: null, transient: true });

    return {
      id,
      title: document.title,
      kind: document.kind,
      content: "The document has been updated successfully.",
    };
  },
});