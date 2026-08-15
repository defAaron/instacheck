import { useId, useRef } from "react"
import { cn } from "@/lib/utils"

type DropZoneProps = {
  disabled?: boolean
  highlighted?: boolean
  fileInputId?: string
  folderInputId?: string
  onFiles: (files: File[]) => void
}

export function DropZone({
  disabled,
  highlighted,
  fileInputId,
  folderInputId,
  onFiles,
}: DropZoneProps) {
  const generatedFileId = useId()
  const generatedFolderId = useId()
  const fileId = fileInputId ?? generatedFileId
  const folderId = folderInputId ?? generatedFolderId
  const folderInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (list: FileList | File[] | null) => {
    if (!list) return
    const files = [...list]
    if (files.length > 0) onFiles(files)
  }

  return (
    <div
      className={cn(
        "border border-foreground px-4 py-5 text-left transition-colors",
        highlighted && "bg-foreground text-background",
        disabled && "opacity-40",
      )}
    >
      <p className="text-[10px] tracking-[0.22em] uppercase">
        ZIP, folder, or JSON
      </p>
      <p
        className={cn(
          "mt-3 text-sm",
          highlighted ? "text-background/70" : "text-muted-foreground",
        )}
      >
        Drop files here. Nothing is uploaded.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <label
          htmlFor={fileId}
          className={cn(
            "cursor-pointer border border-foreground px-3.5 py-2 text-[10px] tracking-[0.18em] uppercase",
            highlighted
              ? "border-background text-background hover:bg-background hover:text-foreground"
              : "hover:bg-foreground hover:text-background",
            disabled && "pointer-events-none",
          )}
        >
          Choose ZIP or JSON
        </label>
        <button
          type="button"
          className={cn(
            "border border-foreground px-3.5 py-2 text-[10px] tracking-[0.18em] uppercase",
            highlighted
              ? "border-background text-background hover:bg-background hover:text-foreground"
              : "hover:bg-foreground hover:text-background",
          )}
          onClick={() => folderInputRef.current?.click()}
          disabled={disabled}
        >
          Choose folder
        </button>
      </div>
      <input
        id={fileId}
        type="file"
        className="sr-only"
        accept=".zip,.json,application/zip,application/json"
        multiple
        disabled={disabled}
        onChange={(event) => {
          handleFiles(event.target.files)
          event.target.value = ""
        }}
      />
      <input
        id={folderId}
        ref={folderInputRef}
        type="file"
        className="sr-only"
        multiple
        disabled={disabled}
        // @ts-expect-error non-standard directory picker
        webkitdirectory=""
        onChange={(event) => {
          handleFiles(event.target.files)
          event.target.value = ""
        }}
      />
    </div>
  )
}
