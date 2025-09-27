import { beforeEach, describe, expect, it, vi } from "vitest";
import { ChatSDKError } from "@/lib/errors";

const mocks = vi.hoisted(() => ({
  mockGetMessageById: vi.fn(),
  mockDeleteMessagesByChatIdAfterTimestamp: vi.fn(),
}));

vi.mock("@/lib/db/queries", () => ({
  getMessageById: mocks.mockGetMessageById,
  deleteMessagesByChatIdAfterTimestamp:
    mocks.mockDeleteMessagesByChatIdAfterTimestamp,
}));

import { deleteTrailingMessages } from "@/app/(chat)/actions";

describe("deleteTrailingMessages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mockDeleteMessagesByChatIdAfterTimestamp.mockResolvedValue(undefined);
  });

  it("deletes trailing messages when the message exists", async () => {
    const message = {
      id: "message-1",
      chatId: "chat-1",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
    };

    mocks.mockGetMessageById.mockResolvedValueOnce([message]);

    await deleteTrailingMessages({ id: message.id });

    expect(
      mocks.mockDeleteMessagesByChatIdAfterTimestamp
    ).toHaveBeenCalledWith({
      chatId: message.chatId,
      timestamp: message.createdAt,
    });
  });

  it("throws a ChatSDKError when the message is not found", async () => {
    expect.assertions(3);

    mocks.mockGetMessageById.mockResolvedValueOnce([]);

    const error = await deleteTrailingMessages({ id: "missing-id" }).catch(
      (currentError) => currentError as ChatSDKError
    );

    expect(error).toBeInstanceOf(ChatSDKError);
    expect(error).toMatchObject({
      type: "not_found",
      surface: "chat",
      cause: "The requested message could not be found.",
    });
    expect(
      mocks.mockDeleteMessagesByChatIdAfterTimestamp
    ).not.toHaveBeenCalled();
  });
});
