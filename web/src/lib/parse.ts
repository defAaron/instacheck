/** Port of nonfollowers.py username extraction and set-diff logic. */

export type UsernameMap = Record<string, string>

export function usernamesFromEntries(entries: unknown[]): UsernameMap {
  const result: UsernameMap = {}
  for (const entry of entries) {
    if (!entry || typeof entry !== "object") continue
    const stringList = (entry as Record<string, unknown>).string_list_data
    if (!Array.isArray(stringList) || stringList.length === 0) continue
    const first = stringList[0]
    if (!first || typeof first !== "object") continue
    const row = first as Record<string, unknown>
    let value = String(row.value || "")
    if (!value && row.href) {
      const href = String(row.href).replace(/\/+$/, "")
      value = href.split("/").pop() ?? ""
    }
    if (!value) continue
    const username = value.replace(/^@+/, "")
    const key = username.toLowerCase()
    if (!(key in result)) result[key] = username
  }
  return result
}

export function extractRelationshipList(
  data: unknown,
  preferredKeys: readonly string[],
): unknown[] {
  if (Array.isArray(data)) return data
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>
    for (const key of preferredKeys) {
      if (key in obj && Array.isArray(obj[key])) return obj[key]
    }
    for (const value of Object.values(obj)) {
      if (Array.isArray(value)) return value
    }
  }
  throw new Error("Unrecognized Instagram export JSON structure")
}

export function loadUsernamesFromJson(
  text: string,
  filename: string,
  preferredKeys: readonly string[],
): UsernameMap {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error(
      `${filename} is not valid JSON. Re-download your Instagram data and choose JSON (not HTML).`,
    )
  }
  return usernamesFromEntries(extractRelationshipList(data, preferredKeys))
}

export function loadFollowing(
  text: string,
  filename = "following.json",
): UsernameMap {
  return loadUsernamesFromJson(text, filename, ["relationships_following"])
}

export function loadFollowersFromFiles(
  files: { name: string; text: string }[],
): UsernameMap {
  const combined: UsernameMap = {}
  const sorted = [...files].sort((a, b) => a.name.localeCompare(b.name))
  for (const file of sorted) {
    Object.assign(
      combined,
      loadUsernamesFromJson(file.text, file.name, [
        "relationships_followers",
        "relationships_follower",
      ]),
    )
  }
  return combined
}

export function loadOptionalList(
  text: string,
  filename: string,
): UsernameMap {
  return loadUsernamesFromJson(text, filename, [])
}

export function notFollowingBack(
  following: UsernameMap,
  followers: UsernameMap,
): string[] {
  return Object.keys(following)
    .filter((key) => !(key in followers))
    .map((key) => following[key])
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
}

export function fans(
  following: UsernameMap,
  followers: UsernameMap,
): string[] {
  return Object.keys(followers)
    .filter((key) => !(key in following))
    .map((key) => followers[key])
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
}

export function sortedUsernames(map: UsernameMap): string[] {
  return Object.values(map).sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase()),
  )
}
