import Attachment from './attachment'

export default class FileAttachmentElement extends HTMLElement {
  constructor() {
    super()
    this.addEventListener('dragenter', onDragenter)
    this.addEventListener('dragover', onDragenter)
    this.addEventListener('dragleave', onDragleave)
    this.addEventListener('drop', onDrop)
    this.addEventListener('paste', onPaste)
    this.addEventListener('change', onChange)
  }

  get directory(): boolean {
    return this.hasAttribute('directory')
  }

  set directory(value: boolean) {
    if (value) {
      this.setAttribute('directory', '')
    } else {
      this.removeAttribute('directory')
    }
  }

  async attach(transferred: File[] | Attachment[] | FileList | DataTransfer) {
    const attachments =
      transferred instanceof DataTransfer
        ? await Attachment.traverse(transferred, this.directory)
        : Attachment.from(transferred)

    const accepted = this.dispatchEvent(
      new CustomEvent('file-attachment-accept', {
        bubbles: true,
        cancelable: true,
        detail: {attachments}
      })
    )

    if (accepted && attachments.length) {
      this.dispatchEvent(
        new CustomEvent('file-attachment-accepted', {
          bubbles: true,
          detail: {attachments}
        })
      )
    }
  }
}

function hasFile(transfer: DataTransfer): boolean {
  return Array.from(transfer.types).indexOf('Files') >= 0
}

let dragging: number | null = null

// Highlight textarea and change drop cursor. Ensure drop target styles
// are cleared after dragging back outside of window.
function onDragenter(event: DragEvent) {
  const target = event.currentTarget as Element

  if (dragging) {
    clearTimeout(dragging)
  }
  dragging = window.setTimeout(() => target.removeAttribute('hover'), 200)

  const transfer = event.dataTransfer
  if (!transfer || !hasFile(transfer)) return

  transfer.dropEffect = 'copy'
  target.setAttribute('hover', '')

  event.stopPropagation()
  event.preventDefault()
}

// Unhighlight textarea and remove drop cursor.
function onDragleave(event: DragEvent) {
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'none'
  }

  const target = event.currentTarget as Element
  target.removeAttribute('hover')

  event.stopPropagation()
  event.preventDefault()
}

function onDrop(event: DragEvent) {
  const container = event.currentTarget
  if (!(container instanceof FileAttachmentElement)) return

  container.removeAttribute('hover')

  const transfer = event.dataTransfer
  if (!transfer || !hasFile(transfer)) return

  container.attach(transfer)
  event.stopPropagation()
  event.preventDefault()
}

const images = /^image\/(gif|png|jpeg)$/

function pastedFile(items: DataTransferItemList): File | null {
  for (const item of items) {
    if (images.test(item.type)) {
      return item.getAsFile()
    }
  }
  return null
}

function onPaste(event: ClipboardEvent) {
  if (!event.clipboardData) return
  if (!event.clipboardData.items) return

  const container = event.currentTarget
  if (!(container instanceof FileAttachmentElement)) return

  const file = pastedFile(event.clipboardData.items)
  if (!file) return

  const files: File[] = [file]
  container.attach(files)
  event.preventDefault()
}

function onChange(event: Event) {
  const container = event.currentTarget
  if (!(container instanceof FileAttachmentElement)) return
  const input = event.target
  if (!(input instanceof HTMLInputElement)) return
  const id = container.getAttribute('input')
  if (!id || input.id !== id) return

  const files = input.files
  if (!files || files.length === 0) return

  container.attach(files)
  input.value = ''
}
