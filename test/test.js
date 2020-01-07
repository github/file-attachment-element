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
})
