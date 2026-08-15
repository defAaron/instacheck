import { Check, Copy, Download, ExternalLink, Search } from "lucide-react"
import { useMemo, useState } from "react"
import { Shell } from "@/components/Shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  downloadFilename,
  downloadTxt,
  type Analysis,
  type ListId,
} from "@/lib/analyze"
import { cn } from "@/lib/utils"

type ResultsProps = {
  handle: string
  analysis: Analysis
  onReset: () => void
}

function profileUrl(username: string): string {
  return `https://www.instagram.com/${encodeURIComponent(username)}/`
}

export function Results({ handle, analysis, onReset }: ResultsProps) {
  const [activeId, setActiveId] = useState<ListId>(analysis.lists[0].id)
  const [query, setQuery] = useState("")
  const [copied, setCopied] = useState<"one" | "all" | null>(null)
  const [copiedName, setCopiedName] = useState<string | null>(null)

  const active =
    analysis.lists.find((list) => list.id === activeId) ?? analysis.lists[0]

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return active.usernames
    return active.usernames.filter((name) =>
      name.toLowerCase().includes(needle),
    )
  }, [active.usernames, query])

  const flash = (kind: "one" | "all", name?: string) => {
    setCopied(kind)
    setCopiedName(name ?? null)
    window.setTimeout(() => {
      setCopied(null)
      setCopiedName(null)
    }, 1400)
  }

  const copyOne = async (username: string) => {
    await navigator.clipboard.writeText(username)
    flash("one", username)
  }

  const copyAll = async () => {
    await navigator.clipboard.writeText(visible.join("\n"))
    flash("all")
  }

  const downloadActive = () => {
    downloadTxt(downloadFilename(handle, active.filenameSlug), visible)
  }

  const displayHandle = handle.replace(/^@+/, "").trim()

  return (
    <Shell
      onHome={onReset}
      nav={
        <Button variant="outline" onClick={onReset}>
          New export
        </Button>
      }
    >
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-5 py-12 sm:px-10">
        <header className="space-y-5">
          <h1 className="font-serif text-4xl leading-none tracking-tight text-foreground sm:text-5xl">
            {displayHandle ? `@${displayHandle}` : "Your export"}
          </h1>
          <div className="flex flex-wrap gap-2">
            <Badge>{analysis.followingCount.toLocaleString()} following</Badge>
            <Badge>{analysis.followersCount.toLocaleString()} followers</Badge>
            <Badge>
              {(
                analysis.lists.find((list) => list.id === "notFollowingBack")
                  ?.usernames.length ?? 0
              ).toLocaleString()}{" "}
              not following back
            </Badge>
          </div>
        </header>

        <div
          role="tablist"
          aria-label="Relationship lists"
          className="flex flex-wrap gap-2"
        >
          {analysis.lists.map((list) => {
            const selected = list.id === active.id
            return (
              <button
                key={list.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => {
                  setActiveId(list.id)
                  setQuery("")
                }}
                className={cn(
                  "border border-foreground px-3 py-1.5 text-[10px] tracking-[0.16em] uppercase outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-foreground",
                  selected
                    ? "bg-foreground text-background"
                    : "bg-transparent text-foreground hover:bg-foreground hover:text-background",
                )}
              >
                {list.label}{" "}
                <span className="ml-1 font-mono tracking-normal opacity-70">
                  {list.usernames.length}
                </span>
              </button>
            )
          })}
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="block min-w-0 flex-1 space-y-2">
              <span className="block text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
                Search
              </span>
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 stroke-[1.25] text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={active.label.toLowerCase()}
                  className="pl-9"
                  spellCheck={false}
                />
              </div>
            </label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={copyAll}
                disabled={visible.length === 0}
              >
                {copied === "all" ? <Check /> : <Copy />}
                Copy {visible.length === active.usernames.length ? "all" : "visible"}
              </Button>
              <Button
                variant="solid"
                onClick={downloadActive}
                disabled={visible.length === 0}
              >
                <Download />
                Download
              </Button>
            </div>
          </div>

          <p className="text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
            {visible.length === active.usernames.length
              ? `${active.usernames.length.toLocaleString()} account${active.usernames.length === 1 ? "" : "s"}`
              : `${visible.length.toLocaleString()} of ${active.usernames.length.toLocaleString()} shown`}
          </p>
        </div>

        <UsernameRows
          usernames={visible}
          copiedName={copied === "one" ? copiedName : null}
          onCopy={copyOne}
        />
      </div>
    </Shell>
  )
}

function UsernameRows({
  usernames,
  copiedName,
  onCopy,
}: {
  usernames: string[]
  copiedName: string | null
  onCopy: (username: string) => void
}) {
  if (usernames.length === 0) {
    return (
      <p className="border border-foreground px-4 py-10 text-center text-sm text-muted-foreground">
        No accounts in this list.
      </p>
    )
  }

  return (
    <ul className="border border-foreground">
      {usernames.map((username) => (
        <li
          key={username}
          className="flex items-center gap-3 border-b border-foreground/20 px-3 py-2.5 last:border-b-0 sm:px-4"
        >
          <span className="min-w-0 flex-1 truncate font-mono text-sm text-foreground">
            {username}
          </span>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Copy ${username}`}
            onClick={() => onCopy(username)}
          >
            {copiedName === username ? <Check /> : <Copy />}
          </Button>
          <a
            href={profileUrl(username)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${username} on Instagram`}
            className="inline-flex size-8 items-center justify-center text-muted-foreground outline-none hover:text-foreground focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            <ExternalLink className="size-3.5 stroke-[1.25]" />
          </a>
        </li>
      ))}
    </ul>
  )
}
