import { describe, expect, it } from "vitest"
import {
  extractRelationshipList,
  fans,
  loadFollowersFromFiles,
  loadFollowing,
  loadUsernamesFromJson,
  notFollowingBack,
  usernamesFromEntries,
} from "./parse"

describe("usernamesFromEntries", () => {
  it("reads value and strips @", () => {
    expect(
      usernamesFromEntries([
        { string_list_data: [{ value: "@Ada" }] },
        { string_list_data: [{ value: "bob" }] },
      ]),
    ).toEqual({ ada: "Ada", bob: "bob" })
  })

  it("falls back to the last href path segment", () => {
    expect(
      usernamesFromEntries([
        {
          string_list_data: [{ href: "https://www.instagram.com/_u/casey/" }],
        },
      ]),
    ).toEqual({ casey: "casey" })
  })

  it("keeps the first-seen display casing", () => {
    expect(
      usernamesFromEntries([
        { string_list_data: [{ value: "Casey" }] },
        { string_list_data: [{ value: "casey" }] },
      ]),
    ).toEqual({ casey: "Casey" })
  })

  it("skips malformed entries", () => {
    expect(
      usernamesFromEntries([
        null,
        {},
        { string_list_data: [] },
        { string_list_data: ["x"] },
        { string_list_data: [{ value: "" }] },
      ]),
    ).toEqual({})
  })
})

describe("extractRelationshipList", () => {
  it("returns a top-level list", () => {
    expect(extractRelationshipList([{ a: 1 }], ["relationships_following"])).toEqual([
      { a: 1 },
    ])
  })

  it("prefers the named key on an object", () => {
    expect(
      extractRelationshipList(
        {
          other: [{ skip: true }],
          relationships_following: [{ keep: true }],
        },
        ["relationships_following"],
      ),
    ).toEqual([{ keep: true }])
  })

  it("falls back to the first list value", () => {
    expect(extractRelationshipList({ items: [{ ok: true }] }, [])).toEqual([
      { ok: true },
    ])
  })

  it("throws on unrecognized structures", () => {
    expect(() => extractRelationshipList({ a: 1 }, [])).toThrow(
      "Unrecognized Instagram export JSON structure",
    )
  })
})

describe("loadFollowing / loadFollowersFromFiles", () => {
  it("parses following.json", () => {
    const text = JSON.stringify({
      relationships_following: [{ string_list_data: [{ value: "ada" }] }],
    })
    expect(loadFollowing(text)).toEqual({ ada: "ada" })
  })

  it("merges followers files in name order", () => {
    const combined = loadFollowersFromFiles([
      {
        name: "followers_2.json",
        text: JSON.stringify([{ string_list_data: [{ value: "zoe" }] }]),
      },
      {
        name: "followers_1.json",
        text: JSON.stringify([
          { string_list_data: [{ value: "Ada" }] },
          { string_list_data: [{ value: "bob" }] },
        ]),
      },
    ])
    expect(combined).toEqual({ ada: "Ada", bob: "bob", zoe: "zoe" })
  })

  it("rejects invalid JSON with the CLI message", () => {
    expect(() => loadFollowing("<html></html>", "following.json")).toThrow(
      "following.json is not valid JSON. Re-download your Instagram data and choose JSON (not HTML).",
    )
  })

  it("parses usernames from a raw JSON string via loadUsernamesFromJson", () => {
    const text = JSON.stringify({
      relationships_followers: [{ string_list_data: [{ value: "ada" }] }],
    })
    expect(
      loadUsernamesFromJson(text, "followers_1.json", [
        "relationships_followers",
      ]),
    ).toEqual({ ada: "ada" })
  })
})

describe("set diffs", () => {
  const following = { ada: "Ada", bob: "bob", casey: "Casey" }
  const followers = { bob: "Bob", dana: "dana" }

  it("lists accounts you follow who do not follow back", () => {
    expect(notFollowingBack(following, followers)).toEqual(["Ada", "Casey"])
  })

  it("lists fans who follow you that you do not follow", () => {
    expect(fans(following, followers)).toEqual(["dana"])
  })
})
