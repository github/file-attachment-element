import { vi } from 'vitest'
import FileAttachmentElement from '../src/file-attachment-element'

// Define a global CustomEvent class if not already available
if (typeof window.CustomEvent !== 'function') {
  window.CustomEvent = class CustomEvent extends Event {
    detail: any
    constructor(event: string, params?: CustomEventInit) {
      super(event, params)
      this.detail = params?.detail || {}
    }
  } as any
}

// Register the custom element before running tests
customElements.define('file-attachment', FileAttachmentElement)

// Mock window.FileAttachmentElement for element creation tests
Object.defineProperty(window, 'FileAttachmentElement', {
  value: FileAttachmentElement
})

// Polyfill for DataTransfer if needed (based on test environment)
if (typeof DataTransfer === 'undefined') {
  // @ts-ignore
  global.DataTransfer = class DataTransfer {
    files: File[] = []
    items = {
      add: (fileOrData: any, type?: string) => {
        if (fileOrData instanceof File) {
          this.files.push(fileOrData)
        }
      }
    }
  }
}
