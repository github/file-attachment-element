const pkg = require('./package.json')

export default {
  input: 'dist/file-attachment-element.js',
  output: [
    {
      file: pkg['module'],
      format: 'es'
    },
    {
      file: pkg['main'],
      format: 'umd',
      name: 'FileAttachmentElement',
      exports: 'named'
    }
  ]
}
