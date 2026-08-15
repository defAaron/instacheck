import { describe, expect, it } from "vitest"
import { analyzeFiles, downloadFilename } from "./analyze"

function jsonFile(name: string, data: unknown, relativePath = name): File {
  const file = new File([JSON.stringify(data)], name, {
    type: "application/json",
  })
  Object.defineProperty(file, "webkitRelativePath", { value: relativePath })
  return file
}

const followingJson = {
  relationships_following: [
    { string_list_data: [{ value: "ada" }] },
    { string_list_data: [{ value: "bob" }] },
  ],
}
const followersJson = [{ string_list_data: [{ value: "bob" }] }]
const pendingJson = [{ string_list_data: [{ value: "casey" }] }]

describe("analyzeFiles", () => {
  it("always includes not-following-back and fans", async () => {
    const analysis = await analyzeFiles([
      jsonFile("following.json", followingJson),
      jsonFile("followers_1.json", followersJson),
    ])
    expect(analysis.followingCount).toBe(2)
    expect(analysis.followersCount).toBe(1)
    expect(analysis.lists.map((list) => list.id)).toEqual([
      "notFollowingBack",
      "fans",
    ])
    expect(analysis.lists[0].usernames).toEqual(["ada"])
  })

  it("adds extra tabs only when those JSON files exist", async () => {
    const analysis = await analyzeFiles([
      jsonFile(
        "following.json",
        followingJson,
        "followers_and_following/following.json",
      ),
      jsonFile(
        "followers_1.json",
        followersJson,
        "followers_and_following/followers_1.json",
      ),
      jsonFile(
        "pending_follow_requests.json",
        pendingJson,
        "followers_and_following/pending_follow_requests.json",
      ),
    ])
    expect(analysis.lists.map((list) => list.id)).toEqual([
      "notFollowingBack",
      "fans",
      "pending",
    ])
    expect(analysis.lists[2].usernames).toEqual(["casey"])
  })
})

describe("downloadFilename", () => {
  it("prefixes the handle when present", () => {
    expect(downloadFilename("@ada", "not-following-back")).toBe(
      "ada-not-following-back.txt",
    )
  })

  it("omits the handle when empty", () => {
    expect(downloadFilename("  ", "fans")).toBe("fans.txt")
  })
})
