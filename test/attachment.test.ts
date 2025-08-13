import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import Attachment from '../src/attachment'
import FileAttachmentElement from '../src/file-attachment-element'

describe('file-attachment', () => {
  describe('element creation', () => {
    it('creates from document.createElement', () => {
      const el = document.createElement('file-attachment')
      expect(el.nodeName).toBe('FILE-ATTACHMENT')
      expect(el).toBeInstanceOf(window.FileAttachmentElement)
    })

    it('creates from constructor', () => {
      const el = new window.FileAttachmentElement()
      expect(el.nodeName).toBe('FILE-ATTACHMENT')
    })
  })

  describe('attachment', () => {
    it('has a full path without a directory', () => {
      const file = new File(['hubot'], 'test.txt', {type: 'text/plain'})
      const attachment = new Attachment(file)
      expect(attachment.fullPath).toBe('test.txt')
    })

    it('has a full path with a directory', () => {
      const file = new File(['hubot'], 'test.txt', {type: 'text/plain'})
      const attachment = new Attachment(file, 'tmp')
      expect(attachment.fullPath).toBe('tmp/test.txt')
    })

    it('detects non image types', () => {
      const file = new File(['hubot'], 'test.txt', {type: 'text/plain'})
      const attachment = new Attachment(file)
      expect(attachment.isImage()).toBe(false)
    })

    it('detects image types', () => {
      const file = new File(['hubot'], 'test.gif', {type: 'image/gif'})
      const attachment = new Attachment(file)
      expect(attachment.isImage()).toBe(true)
    })

    it('detects mp4 video types', () => {
      const file = new File(['hubot'], 'test.mp4', {type: 'video/mp4'})
      const attachment = new Attachment(file)
      expect(attachment.isVideo()).toBe(true)
    })

    it('detects quicktime video types', () => {
      const file = new File(['hubot'], 'test.mov', {type: 'video/quicktime'})
      const attachment = new Attachment(file)
      expect(attachment.isVideo()).toBe(true)
    })

    it('detects non video types', () => {
      const file = new File(['hubot'], 'test.txt', {type: 'text/plain'})
      const attachment = new Attachment(file)
      expect(attachment.isVideo()).toBe(false)
    })

    it('transitions through save states', () => {
      const file = new File(['hubot'], 'test.txt', {type: 'text/plain'})
      const attachment = new Attachment(file)
      expect(attachment.isPending()).toBe(true)
      expect(attachment.percent).toBe(0)

      attachment.saving(10)
      expect(attachment.isSaving()).toBe(true)
      expect(attachment.percent).toBe(10)

      attachment.saved({id: '42', name: 'saved.txt', href: '/s3/saved.txt'})
      expect(attachment.isSaved()).toBe(true)
      expect(attachment.id).toBe('42')
      expect(attachment.name).toBe('saved.txt')
      expect(attachment.href).toBe('/s3/saved.txt')
    })
  })

  describe('element', () => {
    let fileAttachment: InstanceType<typeof FileAttachmentElement>
    let input: HTMLInputElement

    beforeEach(() => {
      document.body.innerHTML = `
        <file-attachment>
          <input type="file">
        </file-attachment>`

      fileAttachment = document.querySelector('file-attachment')!
      input = document.querySelector('input')!
    })

    afterEach(() => {
      document.body.innerHTML = ''
    })

    it('attaches files via .attach', async () => {
      const listener = once('file-attachment-accepted')

      const dataTransfer = new DataTransfer()
      const file = new File(['hubot'], 'test.txt', {type: 'text/plain'})
      dataTransfer.items.add(file)
      fileAttachment.attach(dataTransfer)

      const event = await listener as CustomEvent
      expect(event.detail.attachments[0].file.name).toBe('test.txt')
    })

    it('attaches files via drop', async () => {
      const listener = once('file-attachment-accepted')

      const dataTransfer = new DataTransfer()
      const file = new File(['hubot'], 'test.txt', {type: 'text/plain'})
      dataTransfer.items.add(file)
      const dropEvent = new DragEvent('drop', {bubbles: true, dataTransfer})
      fileAttachment.dispatchEvent(dropEvent)

      const event = await listener as CustomEvent
      expect(event.detail.attachments[0].file.name).toBe('test.txt')
    })

    it('attaches images via paste', async () => {
      const listener = once('file-attachment-accepted')

      const dataTransfer = new DataTransfer()
      const file = new File(['hubot'], 'test.png', {type: 'image/png'})
      dataTransfer.items.add(file)
      const dropEvent = new ClipboardEvent('paste', {bubbles: true, clipboardData: dataTransfer})
      fileAttachment.dispatchEvent(dropEvent)

      const event = await listener as CustomEvent
      expect(event.detail.attachments[0].file.name).toBe('test.png')
    })

    it('attaches files via input', async () => {
      const listener = once('file-attachment-accepted')

      const dataTransfer = new DataTransfer()
      const file = new File(['hubot'], 'test.png', {type: 'image/png'})
      dataTransfer.items.add(file)
      input.files = dataTransfer.files
      input.dispatchEvent(new Event('change', {bubbles: true}))

      const event = await listener as CustomEvent
      expect(event.detail.attachments[0].file.name).toBe('test.png')
      expect(input.files.length).toBe(0)
    })

    it('bubbles the dragenter event after cancelling its default behavior', async () => {
      const dataTransfer = new DataTransfer()
      const file = new File(['hubot'], 'test.txt', {type: 'text/plain'})
      dataTransfer.items.add(file)

      const dragEvent = new DragEvent('dragenter', {bubbles: true, cancelable: true, dataTransfer})

      const listener = once('dragenter')
      input.dispatchEvent(dragEvent)

      const event = await listener as DragEvent
      expect(event).toBe(dragEvent)
      expect(event.defaultPrevented).toBe(true)
    })

    it('bubbles the dragover event after cancelling its default behavior', async () => {
      const dataTransfer = new DataTransfer()
      const file = new File(['hubot'], 'test.txt', {type: 'text/plain'})
      dataTransfer.items.add(file)

      const dragEvent = new DragEvent('dragover', {bubbles: true, cancelable: true, dataTransfer})

      const listener = once('dragover')
      input.dispatchEvent(dragEvent)

      const event = await listener as DragEvent
      expect(event).toBe(dragEvent)
      expect(event.defaultPrevented).toBe(true)
    })

    it('attaches the correct file when browser sends multiple data transfer items with image as type', async () => {
      const listener = once('file-attachment-accepted')

      const dataTransfer = new DataTransfer()
      const file = new File(['hubot'], 'test.png', {type: 'image/png'})
      dataTransfer.items.add('some string', 'image/jpeg')
      dataTransfer.items.add(file)
      const dropEvent = new ClipboardEvent('paste', {bubbles: true, clipboardData: dataTransfer})
      fileAttachment.dispatchEvent(dropEvent)

      const event = await listener as CustomEvent
      expect(event.detail.attachments[0].file.name).toBe('test.png')
    })
  })
})

function once(eventName: string): Promise<Event> {
  return new Promise(resolve => document.addEventListener(eventName, resolve, {once: true}))
}
