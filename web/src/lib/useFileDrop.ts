import { useState, type DragEvent, type HTMLAttributes } from "react"
import { collectDroppedFiles } from "@/lib/dropFiles"

export function useFileDrop(
  disabled: boolean | undefined,
  onFiles: (files: File[]) => void,
) {
  const [active, setActive] = useState(false)

  const dropProps: Pick<
    HTMLAttributes<HTMLDivElement>,
    "onDragEnter" | "onDragOver" | "onDragLeave" | "onDrop"
  > = {
    onDragEnter: (event) => {
      event.preventDefault()
      if (!disabled) setActive(true)
    },
    onDragOver: (event) => {
      event.preventDefault()
      if (!disabled) setActive(true)
    },
    onDragLeave: (event) => {
      if (event.currentTarget.contains(event.relatedTarget as Node)) return
      setActive(false)
    },
    onDrop: async (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      setActive(false)
      if (disabled) return
      const files = await collectDroppedFiles(event.dataTransfer)
      if (files.length > 0) onFiles(files)
    },
  }

  return { active, dropProps }
}
