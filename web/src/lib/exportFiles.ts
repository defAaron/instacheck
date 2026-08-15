import { BlobReader, TextWriter, ZipReader } from "@zip.js/zip.js"

export type NamedText = { name: string; text: string }

export type ExportTexts = {
  following: NamedText
  followers: NamedText[]
  pending?: NamedText
  unfollowed?: NamedText
  closeFriends?: NamedText
  blocked?: NamedText
}

export const EXTRA_FILENAMES = {
  pending: "pending_follow_requests.json",
  unfollowed: "recently_unfollowed_profiles.json",
  closeFriends: "close_friends.json",
  blocked: "blocked_profiles.json",
} as const

export function normalizePath(path: string): string {
  return path.replace(/\\/g, "/").replace(/^\.?\//, "")
}

export function basename(path: string): string {
  const normalized = normalizePath(path)
  const i = normalized.lastIndexOf("/")
  return i === -1 ? normalized : normalized.slice(i + 1)
}

export function dirname(path: string): string {
  const normalized = normalizePath(path)
  const i = normalized.lastIndexOf("/")
  return i === -1 ? "" : normalized.slice(0, i)
}

function lowerName(path: string): string {
  return basename(path).toLowerCase()
}

export function isFollowingJson(path: string): boolean {
  return lowerName(path) === "following.json"
}

export function isFollowersJson(path: string): boolean {
  const name = lowerName(path)
  return name.startsWith("followers") && name.endsWith(".json")
}

export function isHtmlFollowersOrFollowing(path: string): boolean {
  const name = lowerName(path)
  return (
    name === "following.html" ||
    (name.startsWith("followers") && name.endsWith(".html"))
  )
}

export function isRelevantExportPath(path: string): boolean {
  const name = lowerName(path)
  if (name.endsWith(".zip")) return true
  if (isHtmlFollowersOrFollowing(path)) return true
  if (!name.endsWith(".json")) return false
  return (
    isFollowingJson(path) ||
    isFollowersJson(path) ||
    Object.values(EXTRA_FILENAMES).includes(
      name as (typeof EXTRA_FILENAMES)[keyof typeof EXTRA_FILENAMES],
    )
  )
}

function endsWithDir(dir: string, suffix: string): boolean {
  return dir === suffix || dir.endsWith(`/${suffix}`)
}

export function findRelationshipDir(paths: string[]): string {
  const files = paths.map(normalizePath)
  const following = files.filter(isFollowingJson)
  const parents = following.map(dirname)

  const connections = [
    ...new Set(
      parents.filter((dir) =>
        endsWithDir(dir, "connections/followers_and_following"),
      ),
    ),
  ]
  if (connections.length === 1) return connections[0]
  if (connections.length > 1) {
    throw new Error(
      "Found multiple following.json files. Drop the followers_and_following folder specifically.",
    )
  }

  const nested = [
    ...new Set(
      parents.filter((dir) => endsWithDir(dir, "followers_and_following")),
    ),
  ]
  if (nested.length === 1) return nested[0]
  if (nested.length > 1) {
    throw new Error(
      "Found multiple following.json files. Drop the followers_and_following folder specifically.",
    )
  }

  if (following.length === 1) return dirname(following[0])
  if (following.length > 1) {
    throw new Error(
      "Found multiple following.json files. Drop the followers_and_following folder specifically.",
    )
  }

  const htmlHint = files.some(isHtmlFollowersOrFollowing)
    ? " This looks like an HTML export — request a new download in JSON format."
    : ""
  throw new Error(
    `Could not find following.json.${htmlHint} Unzip your Instagram data export and try again.`,
  )
}

function extraKeyForName(
  name: string,
): keyof typeof EXTRA_FILENAMES | undefined {
  const lower = name.toLowerCase()
  for (const [key, filename] of Object.entries(EXTRA_FILENAMES) as [
    keyof typeof EXTRA_FILENAMES,
    string,
  ][]) {
    if (filename === lower) return key
  }
  return undefined
}

export function collectExportPaths(paths: string[], dir: string): {
  following: string
  followers: string[]
  extras: Partial<Record<keyof typeof EXTRA_FILENAMES, string>>
} {
  const inDir = paths
    .map(normalizePath)
    .filter((path) => dirname(path) === dir)

  const followingPath = inDir.find(isFollowingJson)
  if (!followingPath) {
    throw new Error("Missing following.json")
  }

  const followers = inDir.filter(isFollowersJson).sort((a, b) =>
    basename(a).localeCompare(basename(b)),
  )
  if (followers.length === 0) {
    throw new Error(
      "No followers*.json files found. Make sure Followers and following was included in your export.",
    )
  }

  const extras: Partial<Record<keyof typeof EXTRA_FILENAMES, string>> = {}
  for (const path of inDir) {
    const key = extraKeyForName(basename(path))
    if (key) extras[key] = path
  }

  return { following: followingPath, followers, extras }
}

type ReadableFile = {
  path: string
  readText: () => Promise<string>
}

async function textsFromReadables(
  files: ReadableFile[],
): Promise<ExportTexts> {
  const paths = files.map((file) => file.path)
  const dir = findRelationshipDir(paths)
  const collected = collectExportPaths(paths, dir)
  const byPath = new Map(files.map((file) => [normalizePath(file.path), file]))

  const read = async (path: string): Promise<NamedText> => {
    const file = byPath.get(path)
    if (!file) throw new Error(`Missing ${basename(path)}`)
    return { name: basename(path), text: await file.readText() }
  }

  const extras: Partial<
    Pick<ExportTexts, "pending" | "unfollowed" | "closeFriends" | "blocked">
  > = {}
  if (collected.extras.pending) {
    extras.pending = await read(collected.extras.pending)
  }
  if (collected.extras.unfollowed) {
    extras.unfollowed = await read(collected.extras.unfollowed)
  }
  if (collected.extras.closeFriends) {
    extras.closeFriends = await read(collected.extras.closeFriends)
  }
  if (collected.extras.blocked) {
    extras.blocked = await read(collected.extras.blocked)
  }

  return {
    following: await read(collected.following),
    followers: await Promise.all(collected.followers.map(read)),
    ...extras,
  }
}

async function loadFromZip(file: File): Promise<ExportTexts> {
  const reader = new ZipReader(new BlobReader(file))
  try {
    const entries = await reader.getEntries()
    const readables: ReadableFile[] = []
    for (const entry of entries) {
      if (entry.directory) continue
      const path = entry.filename
      if (!isRelevantExportPath(path) && !isHtmlFollowersOrFollowing(path)) {
        continue
      }
      readables.push({
        path,
        readText: async () => {
          if (!entry.getData) {
            throw new Error(`Could not read ${basename(path)} from the ZIP.`)
          }
          return entry.getData(new TextWriter())
        },
      })
    }
    return textsFromReadables(readables)
  } finally {
    await reader.close()
  }
}

function filePath(file: File): string {
  const relative = file.webkitRelativePath
  return relative && relative.length > 0 ? relative : file.name
}

export async function loadExportTexts(files: File[]): Promise<ExportTexts> {
  if (files.length === 0) {
    throw new Error(
      "Drop a ZIP, the followers_and_following folder, or the JSON files from your export.",
    )
  }

  const zips = files.filter((file) => file.name.toLowerCase().endsWith(".zip"))
  if (zips.length > 1) {
    throw new Error("Drop a single ZIP export.")
  }
  if (zips.length === 1) {
    return loadFromZip(zips[0])
  }

  const relevant = files.filter((file) => isRelevantExportPath(filePath(file)))
  return textsFromReadables(
    relevant.map((file) => ({
      path: filePath(file),
      readText: () => file.text(),
    })),
  )
}
