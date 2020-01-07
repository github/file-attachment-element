import FileAttachmentElement from './file-attachment-element'

export default FileAttachmentElement
export {default as Attachment} from './attachment'

declare global {
  interface Window {
    FileAttachmentElement: typeof FileAttachmentElement
  }
}

if (!window.customElements.get('file-attachment')) {
  window.FileAttachmentElement = FileAttachmentElement
  window.customElements.define('file-attachment', FileAttachmentElement)
}
