import { loadExportTexts } from "./exportFiles"
import {
  fans,
  loadFollowing,
  loadFollowersFromFiles,
  loadOptionalList,
  notFollowingBack,
  sortedUsernames,
} from "./parse"

export type ListId =
  | "notFollowingBack"
  | "fans"
  | "pending"
  | "unfollowed"
  | "closeFriends"
  | "blocked"

export type AccountList = {
  id: ListId
  label: string
  filenameSlug: string
  usernames: string[]
}

export type Analysis = {
  followingCount: number
  followersCount: number
  lists: AccountList[]
}

export async function analyzeFiles(files: File[]): Promise<Analysis> {
  const texts = await loadExportTexts(files)
  const following = loadFollowing(texts.following.text, texts.following.name)
  if (Object.keys(following).length === 0) {
    throw new Error("No following entries found in the export.")
  }
  const followers = loadFollowersFromFiles(texts.followers)

  const lists: AccountList[] = [
    {
      id: "notFollowingBack",
      label: "Not following back",
      filenameSlug: "not-following-back",
      usernames: notFollowingBack(following, followers),
    },
    {
      id: "fans",
      label: "Fans",
      filenameSlug: "fans",
      usernames: fans(following, followers),
    },
  ]

  if (texts.pending) {
    lists.push({
      id: "pending",
      label: "Pending requests",
      filenameSlug: "pending-requests",
      usernames: sortedUsernames(
        loadOptionalList(texts.pending.text, texts.pending.name),
      ),
    })
  }
  if (texts.unfollowed) {
    lists.push({
      id: "unfollowed",
      label: "Recently unfollowed",
      filenameSlug: "recently-unfollowed",
      usernames: sortedUsernames(
        loadOptionalList(texts.unfollowed.text, texts.unfollowed.name),
      ),
    })
  }
  if (texts.closeFriends) {
    lists.push({
      id: "closeFriends",
      label: "Close friends",
      filenameSlug: "close-friends",
      usernames: sortedUsernames(
        loadOptionalList(texts.closeFriends.text, texts.closeFriends.name),
      ),
    })
  }
  if (texts.blocked) {
    lists.push({
      id: "blocked",
      label: "Blocked",
      filenameSlug: "blocked",
      usernames: sortedUsernames(
        loadOptionalList(texts.blocked.text, texts.blocked.name),
      ),
    })
  }

  return {
    followingCount: Object.keys(following).length,
    followersCount: Object.keys(followers).length,
    lists,
  }
}

export function downloadFilename(
  handle: string,
  slug: string,
): string {
  const trimmed = handle.replace(/^@+/, "").trim()
  return trimmed ? `${trimmed}-${slug}.txt` : `${slug}.txt`
}

export function downloadTxt(filename: string, lines: string[]): void {
  const content = lines.join("\n") + (lines.length ? "\n" : "")
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
