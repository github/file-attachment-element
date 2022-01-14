export default class Attachment {
  file: File
  directory: string | undefined
  state: 'pending' | 'saving' | 'saved'
  id: string | null
  href: string | null
  name: string | null
  percent: number

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
    this.state = 'pending'
    this.id = null
    this.href = null
    this.name = null
    this.percent = 0
  }

  get fullPath(): string {
    return this.directory ? `${this.directory}/${this.file.name}` : this.file.name
  }

  isImage(): boolean {
    return ['image/gif', 'image/png', 'image/jpg', 'image/jpeg', 'image/svg+xml'].indexOf(this.file.type) > -1
  }

  isVideo(): boolean {
    return ['video/mp4', 'video/quicktime'].indexOf(this.file.type) > -1
  }

  saving(percent: number): void {
    if (this.state !== 'pending' && this.state !== 'saving') {
      throw new Error(`Unexpected transition from ${this.state} to saving`)
    }
    this.state = 'saving'
    this.percent = percent
  }

  saved(attributes?: {id?: string | null; href?: string | null; name?: string | null}): void {
    if (this.state !== 'pending' && this.state !== 'saving') {
      throw new Error(`Unexpected transition from ${this.state} to saved`)
    }
    this.state = 'saved'
    this.id = attributes?.id ?? null
    this.href = attributes?.href ?? null
    this.name = attributes?.name ?? null
  }

  isPending(): boolean {
    return this.state === 'pending'
  }

  isSaving(): boolean {
    return this.state === 'saving'
  }

  isSaved(): boolean {
    return this.state === 'saved'
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
  return Promise.resolve(visible(Array.from(transfer.files || [])).map(f => new Attachment(f)))
}

function hidden(file: File | FileSystemEntry): boolean {
  return file.name.startsWith('.')
}

function visible<T extends File | FileSystemEntry>(files: T[]): T[] {
  return Array.from(files).filter(file => !hidden(file))
}

function getFile(entry: FileSystemFileEntry): Promise<File> {
  return new Promise(function (resolve, reject) {
    entry.file(resolve, reject)
  })
}

function getEntries(entry: FileSystemDirectoryEntry): Promise<FileSystemEntry[]> {
  return new Promise(function (resolve, reject) {
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
      results.push(...(await traverse(entry.fullPath, await getEntries(entry as any))))
    } else {
      const file = await getFile(entry as any)
      results.push(new Attachment(file, path))
    }
  }
  return results
}

function isDirectory(transfer: DataTransfer): boolean {
  return (
    transfer.items &&
    Array.from(transfer.items).some((item: any) => {
      const entry = item.webkitGetAsEntry && item.webkitGetAsEntry()
      return entry && entry.isDirectory
    })
  )
}

function roots(transfer: DataTransfer): FileSystemEntry[] {
  return Array.from(transfer.items)
    .map((item: any) => item.webkitGetAsEntry())
    .filter(entry => entry != null)
}
