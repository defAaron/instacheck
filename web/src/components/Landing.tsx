import { useId } from "react"
import { DropZone } from "@/components/DropZone"
import { Shell } from "@/components/Shell"
import { buttonVariants } from "@/components/ui/button-variants"
import { Input } from "@/components/ui/input"
import { useFileDrop } from "@/lib/useFileDrop"
import { cn } from "@/lib/utils"
import hero from "@/assets/hero.png"

type LandingProps = {
  handle: string
  onHandleChange: (value: string) => void
  loading: boolean
  error: string | null
  onFiles: (files: File[]) => void
}

export function Landing({
  handle,
  onHandleChange,
  loading,
  error,
  onFiles,
}: LandingProps) {
  const fileInputId = useId()
  const folderInputId = useId()
  const { active, dropProps } = useFileDrop(loading, onFiles)

  return (
    <div {...dropProps}>
      <Shell
        nav={
          <>
            <a href="#how" className="hover:underline underline-offset-4">
              How
            </a>
            <label
              htmlFor={fileInputId}
              className={cn(buttonVariants(), "cursor-pointer")}
            >
              Drop export
            </label>
          </>
        }
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <section className="flex flex-1 flex-col items-center justify-center px-5 py-10 text-center sm:px-10">
            <h1 className="font-serif text-[2.75rem] leading-[0.95] tracking-tight text-foreground sm:text-6xl md:text-7xl">
              Who you follow
              <br />
              who doesn’t follow back
            </h1>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
              Parse your official Instagram data export in this browser. Files
              never leave your device — no login, no upload, no scraping.
            </p>
            <label
              htmlFor={fileInputId}
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-8 cursor-pointer",
                loading && "pointer-events-none opacity-40",
              )}
            >
              {loading ? "Reading export" : "Drop export"}
            </label>
          </section>

          <section className="flex flex-col gap-10 px-5 pb-8 sm:flex-row sm:items-end sm:justify-between sm:px-10">
            <img
              src={hero}
              alt=""
              className="hidden h-52 w-36 border border-foreground object-cover sm:block"
            />

            <aside className="flex w-full max-w-sm flex-col gap-6">
              <label className="block space-y-2">
                <span className="block text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
                  Handle
                </span>
                <Input
                  value={handle}
                  onChange={(event) => onHandleChange(event.target.value)}
                  placeholder="username"
                  autoComplete="username"
                  spellCheck={false}
                />
              </label>

              <div className="space-y-2">
                <p className="text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
                  Export
                </p>
                <DropZone
                  disabled={loading}
                  highlighted={active}
                  fileInputId={fileInputId}
                  folderInputId={folderInputId}
                  onFiles={onFiles}
                />
              </div>

              {error && (
                <p
                  role="alert"
                  className="border border-destructive px-3 py-2 text-sm text-destructive"
                >
                  {error}
                </p>
              )}
            </aside>
          </section>
        </div>
      </Shell>

      <section id="how" className="w-full max-w-md px-5 py-16 sm:px-10">
        <p className="text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
          How to download
        </p>
        <ol className="mt-4 space-y-3 text-xs leading-relaxed text-muted-foreground">
          <li>
            <span className="mr-2 text-foreground">01</span>
            In Instagram or{" "}
            <a
              href="https://accountscenter.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-2"
            >
              accountscenter.instagram.com
            </a>
            : Settings → Your activity → Download your information.
          </li>
          <li>
            <span className="mr-2 text-foreground">02</span>
            Choose JSON, not HTML.
          </li>
          <li>
            <span className="mr-2 text-foreground">03</span>
            Include Followers and following.
          </li>
          <li>
            <span className="mr-2 text-foreground">04</span>
            Wait for the email, then drop the ZIP or folder here.
          </li>
        </ol>
      </section>
    </div>
  )
}
