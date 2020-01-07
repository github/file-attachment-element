export default class Attachment {
  file: File
  directory: string | undefined

  static traverse(transfer: DataTransfer, directory: boolean): Promise<Attachment[]> {
    return transferredFiles(transfer, directory)
  }

  static from(files: File[] | Attachment[] | FileList): Attachment[] {
    const result = []
    for (const file of files) {
      if (file instanceof File) {
        result.push(new Attachment(file))
      } else if (file instanceof Attachment) {
        result.push(file)
      } else {
        throw new Error('Unexpected type')
      }
    }
    return result
  }

  constructor(file: File, directory?: string) {
    this.file = file
    this.directory = directory
  }

  get fullPath(): string {
    return this.directory ? `${this.directory}/${this.file.name}` : this.file.name
  }

  isImage(): boolean {
    return ['image/gif', 'image/png', 'image/jpg', 'image/jpeg'].indexOf(this.file.type) > -1
  }
}

declare class FileSystemEntry {
  fullPath: string
  isDirectory: boolean
  isFile: boolean
  name: string
}

declare class FileSystemFileEntry extends FileSystemEntry {
  file(onsuccess: (file: File) => void, onerror: (error: Error) => void): void
}

declare class FileSystemDirectoryReader {
  readEntries(onsuccess: (entries: FileSystemEntry[]) => void, onerror: (error: Error) => void): void
}

declare class FileSystemDirectoryEntry extends FileSystemEntry {
  createReader(): FileSystemDirectoryReader
}

function transferredFiles(transfer: DataTransfer, directory: boolean): Promise<Attachment[]> {
  if (directory && isDirectory(transfer)) {
    return traverse('', roots(transfer))
  }
  return Promise.resolve(visible(Array.from(transfer.files)).map(f => new Attachment(f)))
}

function hidden(file: File | FileSystemEntry): boolean {
  return file.name.startsWith('.')
}

function visible<T extends File | FileSystemEntry>(files: T[]): T[] {
  return Array.from(files).filter(file => !hidden(file))
}

function getFile(entry: FileSystemFileEntry): Promise<File> {
  return new Promise(function(resolve, reject) {
    entry.file(resolve, reject)
  })
}

function getEntries(entry: FileSystemDirectoryEntry): Promise<FileSystemEntry[]> {
  return new Promise(function(resolve, reject) {
    const result: FileSystemEntry[] = []
    const reader = entry.createReader()
    const read = () => {
      reader.readEntries(entries => {
        if (entries.length > 0) {
          result.push(...entries)
          read()
        } else {
          resolve(result)
        }
      }, reject)
    }
    read()
  })
}

async function traverse(path: string, entries: FileSystemEntry[]): Promise<Attachment[]> {
  const results = []
  for (const entry of visible(entries)) {
    if (entry.isDirectory) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      results.push(...(await traverse(entry.fullPath, await getEntries(entry as any))))
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const file = await getFile(entry as any)
      results.push(new Attachment(file, path))
    }
  }
  return results
}

function isDirectory(transfer: DataTransfer): boolean {
  return (
    transfer.items &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Array.from(transfer.items).some((item: any) => {
      const entry = item.webkitGetAsEntry && item.webkitGetAsEntry()
      return entry && entry.isDirectory
    })
  )
}

function roots(transfer: DataTransfer): FileSystemEntry[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return Array.from(transfer.items).map((item: any) => item.webkitGetAsEntry())
}
