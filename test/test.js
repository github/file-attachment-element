import {Attachment} from '../dist/index.js'

describe('file-attachment', function() {
  describe('element creation', function() {
    it('creates from document.createElement', function() {
      const el = document.createElement('file-attachment')
      assert.equal('FILE-ATTACHMENT', el.nodeName)
      assert(el instanceof window.FileAttachmentElement)
    })

    it('creates from constructor', function() {
      const el = new window.FileAttachmentElement()
      assert.equal('FILE-ATTACHMENT', el.nodeName)
    })
  })

  describe('attachment', function() {
    it('has a full path without a directory', function() {
      const file = new File(['hubot'], 'test.txt', {type: 'text/plain'})
      const attachment = new Attachment(file)
      assert.equal('test.txt', attachment.fullPath)
    })

    it('has a full path with a directory', function() {
      const file = new File(['hubot'], 'test.txt', {type: 'text/plain'})
      const attachment = new Attachment(file, 'tmp')
      assert.equal('tmp/test.txt', attachment.fullPath)
    })

    it('detects non image types', function() {
      const file = new File(['hubot'], 'test.txt', {type: 'text/plain'})
      const attachment = new Attachment(file)
      assert(!attachment.isImage())
    })

    it('detects image types', function() {
      const file = new File(['hubot'], 'test.gif', {type: 'image/gif'})
      const attachment = new Attachment(file)
      assert(attachment.isImage())
    })

    it('transitions through save states', function() {
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
})
