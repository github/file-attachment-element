import {Attachment} from '../dist/index.js'

describe('file-attachment', function () {
  describe('element creation', function () {
    it('creates from document.createElement', function () {
      const el = document.createElement('file-attachment')
      assert.equal('FILE-ATTACHMENT', el.nodeName)
      assert(el instanceof window.FileAttachmentElement)
    })

    it('creates from constructor', function () {
      const el = new window.FileAttachmentElement()
      assert.equal('FILE-ATTACHMENT', el.nodeName)
    })
  })

  describe('attachment', function () {
    it('has a full path without a directory', function () {
      const file = new File(['hubot'], 'test.txt', {type: 'text/plain'})
      const attachment = new Attachment(file)
      assert.equal('test.txt', attachment.fullPath)
    })

    it('has a full path with a directory', function () {
      const file = new File(['hubot'], 'test.txt', {type: 'text/plain'})
      const attachment = new Attachment(file, 'tmp')
      assert.equal('tmp/test.txt', attachment.fullPath)
    })

    it('detects non image types', function () {
      const file = new File(['hubot'], 'test.txt', {type: 'text/plain'})
      const attachment = new Attachment(file)
      assert(!attachment.isImage())
    })

    it('detects image types', function () {
      const file = new File(['hubot'], 'test.gif', {type: 'image/gif'})
      const attachment = new Attachment(file)
      assert(attachment.isImage())
    })

    it('transitions through save states', function () {
      const file = new File(['hubot'], 'test.txt', {type: 'text/plain'})
      const attachment = new Attachment(file)
      assert(attachment.isPending())
      assert.equal(0, attachment.percent)

      attachment.saving(10)
      assert(attachment.isSaving())
      assert.equal(10, attachment.percent)

      attachment.saved({id: '42', name: 'saved.txt', href: '/s3/saved.txt'})
      assert(attachment.isSaved())
      assert.equal('42', attachment.id)
      assert.equal('saved.txt', attachment.name)
      assert.equal('/s3/saved.txt', attachment.href)
    })
  })

  describe('element', function () {
    let fileAttachment, input
    beforeEach(function () {
      document.body.innerHTML = `
        <file-attachment>
          <input type="file">
        </file-attachment>`

      fileAttachment = document.querySelector('file-attachment')
      input = document.querySelector('input')
    })

    afterEach(function () {
      document.body.innerHTML = ''
    })

    it('attaches files via .attach', async function () {
      const listener = once('file-attachment-accepted')

      const dataTransfer = new DataTransfer()
      const file = new File(['hubot'], 'test.txt', {type: 'text/plain'})
      dataTransfer.items.add(file)
      fileAttachment.attach(dataTransfer)

      const event = await listener
      assert.equal('test.txt', event.detail.attachments[0].file.name)
    })

    it('attaches files via drop', async function () {
      const listener = once('file-attachment-accepted')

      const dataTransfer = new DataTransfer()
      const file = new File(['hubot'], 'test.txt', {type: 'text/plain'})
      dataTransfer.items.add(file)
      const dropEvent = new DragEvent('drop', {bubbles: true, dataTransfer})
      fileAttachment.dispatchEvent(dropEvent)

      const event = await listener
      assert.equal('test.txt', event.detail.attachments[0].file.name)
    })

    it('attaches images via paste', async function () {
      const listener = once('file-attachment-accepted')

      const dataTransfer = new DataTransfer()
      const file = new File(['hubot'], 'test.png', {type: 'image/png'})
      dataTransfer.items.add(file)
      const dropEvent = new ClipboardEvent('paste', {bubbles: true, clipboardData: dataTransfer})
      fileAttachment.dispatchEvent(dropEvent)

      const event = await listener
      assert.equal('test.png', event.detail.attachments[0].file.name)
    })

    it('attaches files via input', async function () {
      const listener = once('file-attachment-accepted')

      const dataTransfer = new DataTransfer()
      const file = new File(['hubot'], 'test.png', {type: 'image/png'})
      dataTransfer.items.add(file)
      input.files = dataTransfer.files
      input.dispatchEvent(new Event('change', {bubbles: true}))

      const event = await listener
      assert.equal('test.png', event.detail.attachments[0].file.name)
      assert.equal(0, input.files.length)
    })
  })
})

function once(eventName) {
  return new Promise(resolve => document.addEventListener(eventName, resolve, {once: true}))
}
