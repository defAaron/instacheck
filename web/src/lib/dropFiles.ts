import { isRelevantExportPath } from "./exportFiles"

function readDirectoryEntries(
  reader: FileSystemDirectoryReader,
): Promise<FileSystemEntry[]> {
  return new Promise((resolve, reject) => {
    reader.readEntries(resolve, reject)
  })
}

async function readAllDirectoryEntries(
  reader: FileSystemDirectoryReader,
): Promise<FileSystemEntry[]> {
  const all: FileSystemEntry[] = []
  let batch = await readDirectoryEntries(reader)
  while (batch.length > 0) {
    all.push(...batch)
    batch = await readDirectoryEntries(reader)
  }
  return all
}

function fileFromEntry(entry: FileSystemFileEntry): Promise<File> {
  return new Promise((resolve, reject) => {
    entry.file(resolve, reject)
  })
}

async function traverseEntry(
  entry: FileSystemEntry | null,
  out: File[],
): Promise<void> {
  if (!entry) return
  if (entry.isFile) {
    const path = entry.fullPath.replace(/^\//, "")
    if (!isRelevantExportPath(path)) return
    const file = await fileFromEntry(entry as FileSystemFileEntry)
    Object.defineProperty(file, "webkitRelativePath", {
      configurable: true,
      value: path,
    })
    out.push(file)
    return
  }
  if (entry.isDirectory) {
    const reader = (entry as FileSystemDirectoryEntry).createReader()
    const children = await readAllDirectoryEntries(reader)
    await Promise.all(children.map((child) => traverseEntry(child, out)))
  }
}

export async function collectDroppedFiles(
  dataTransfer: DataTransfer,
): Promise<File[]> {
  const items = [...dataTransfer.items]
  const collected: File[] = []
  await Promise.all(
    items.map((item) => traverseEntry(item.webkitGetAsEntry(), collected)),
  )
  if (collected.length > 0) return collected
  return [...dataTransfer.files]
}
