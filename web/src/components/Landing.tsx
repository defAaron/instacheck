import { useId } from "react"
import { DropZone } from "@/components/DropZone"
import { Shell } from "@/components/Shell"
import { buttonVariants } from "@/components/ui/button-variants"
import { Input } from "@/components/ui/input"
import { useFileDrop } from "@/lib/useFileDrop"
import { cn } from "@/lib/utils"

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

          <section className="px-5 pb-8 sm:px-10">
            <div className="grid grid-cols-1 border border-foreground bg-[#e6e4de] sm:grid-cols-2">
              <label className="flex flex-col justify-center space-y-2 border-foreground p-6 sm:border-r sm:p-8">
                <span className="block text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
                  Handle
                </span>
                <Input
                  value={handle}
                  onChange={(event) => onHandleChange(event.target.value)}
                  placeholder="username"
                  autoComplete="username"
                  spellCheck={false}
                  className="h-[clamp(2.5rem,3.2vw,3.5rem)] bg-transparent text-[clamp(0.875rem,1.05vw,1.125rem)]"
                />
              </label>

              <div className="flex flex-col space-y-2 border-t border-foreground p-6 sm:border-t-0 sm:p-8">
                <p className="text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
                  Export
                </p>
                <DropZone
                  className="flex-1"
                  disabled={loading}
                  highlighted={active}
                  fileInputId={fileInputId}
                  folderInputId={folderInputId}
                  onFiles={onFiles}
                />
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="mt-4 border border-destructive bg-[#e6e4de] px-3 py-2 text-sm text-destructive"
              >
                {error}
              </p>
            )}
          </section>
        </div>
      </Shell>

      <section id="how" className="flex justify-center px-5 py-16 sm:px-10">
        <div className="w-full max-w-xl border border-foreground bg-white px-8 py-10 sm:px-12 sm:py-12">
          <h2 className="text-center font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
            How to download
          </h2>
          <ol className="mt-8 space-y-5 text-base leading-relaxed text-foreground sm:text-lg">
            <li>
              <span className="mr-3 font-serif text-muted-foreground">01</span>
              In Instagram or{" "}
              <a
                href="https://accountscenter.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                accountscenter.instagram.com
              </a>
              : Settings → Your activity → Download your information.
            </li>
            <li>
              <span className="mr-3 font-serif text-muted-foreground">02</span>
              Choose JSON, not HTML.
            </li>
            <li>
              <span className="mr-3 font-serif text-muted-foreground">03</span>
              Include Followers and following.
            </li>
            <li>
              <span className="mr-3 font-serif text-muted-foreground">04</span>
              Wait for the email, then drop the ZIP or folder here.
            </li>
          </ol>
        </div>
      </section>
    </div>
  )
}
