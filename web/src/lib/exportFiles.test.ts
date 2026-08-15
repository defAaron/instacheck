import { describe, expect, it } from "vitest"
import {
  collectExportPaths,
  findRelationshipDir,
  isRelevantExportPath,
} from "./exportFiles"

describe("findRelationshipDir", () => {
  it("uses the folder itself when following.json is at the root", () => {
    expect(
      findRelationshipDir(["following.json", "followers_1.json"]),
    ).toBe("")
  })

  it("prefers connections/followers_and_following", () => {
    expect(
      findRelationshipDir([
        "instagram-ada/connections/followers_and_following/following.json",
        "instagram-ada/connections/followers_and_following/followers_1.json",
        "instagram-ada/media/following.json",
      ]),
    ).toBe("instagram-ada/connections/followers_and_following")
  })

  it("accepts a dropped followers_and_following folder", () => {
    expect(
      findRelationshipDir([
        "followers_and_following/following.json",
        "followers_and_following/followers_1.json",
      ]),
    ).toBe("followers_and_following")
  })

  it("uses a unique following.json anywhere in the tree", () => {
    expect(
      findRelationshipDir(["export/nested/following.json"]),
    ).toBe("export/nested")
  })

  it("errors when multiple following.json files are found", () => {
    expect(() =>
      findRelationshipDir([
        "one/following.json",
        "two/following.json",
      ]),
    ).toThrow(
      "Found multiple following.json files. Drop the followers_and_following folder specifically.",
    )
  })

  it("detects an HTML export", () => {
    expect(() =>
      findRelationshipDir(["following.html", "followers_1.html"]),
    ).toThrow(
      "This looks like an HTML export — request a new download in JSON format.",
    )
  })

  it("errors when following.json is missing", () => {
    expect(() => findRelationshipDir(["followers_1.json"])).toThrow(
      "Could not find following.json.",
    )
  })
})

describe("collectExportPaths", () => {
  it("collects followers files and optional extras in the chosen dir", () => {
    const collected = collectExportPaths(
      [
        "connections/followers_and_following/following.json",
        "connections/followers_and_following/followers_2.json",
        "connections/followers_and_following/followers_1.json",
        "connections/followers_and_following/pending_follow_requests.json",
        "connections/followers_and_following/blocked_profiles.json",
        "other/following.json",
      ],
      "connections/followers_and_following",
    )
    expect(collected.following).toBe(
      "connections/followers_and_following/following.json",
    )
    expect(collected.followers).toEqual([
      "connections/followers_and_following/followers_1.json",
      "connections/followers_and_following/followers_2.json",
    ])
    expect(collected.extras.pending).toBe(
      "connections/followers_and_following/pending_follow_requests.json",
    )
    expect(collected.extras.blocked).toBe(
      "connections/followers_and_following/blocked_profiles.json",
    )
    expect(collected.extras.unfollowed).toBeUndefined()
  })

  it("errors when followers files are missing", () => {
    expect(() =>
      collectExportPaths(["following.json"], ""),
    ).toThrow(
      "No followers*.json files found. Make sure Followers and following was included in your export.",
    )
  })
})

describe("isRelevantExportPath", () => {
  it("keeps relationship JSON, HTML hints, and zips", () => {
    expect(isRelevantExportPath("following.json")).toBe(true)
    expect(isRelevantExportPath("followers_1.json")).toBe(true)
    expect(isRelevantExportPath("close_friends.json")).toBe(true)
    expect(isRelevantExportPath("following.html")).toBe(true)
    expect(isRelevantExportPath("export.zip")).toBe(true)
    expect(isRelevantExportPath("media/photo.jpg")).toBe(false)
  })
})
