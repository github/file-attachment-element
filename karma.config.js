// Use system Chrome/Chromium if available, otherwise let Karma find it
// In CI environments, CHROME_BIN should be set or the system Chrome should be in PATH
if (!process.env.CHROME_BIN) {
  try {
    const chromiumPath = require('chromium').path
    if (chromiumPath) {
      process.env.CHROME_BIN = chromiumPath
    }
  } catch (e) {
    // If chromium package doesn't work, let Karma use system Chrome
  }
}

module.exports = function (config) {
  config.set({
    frameworks: ['mocha', 'chai'],
    files: [
      { pattern: 'dist/index.js', type: 'module' },
      { pattern: 'test/test.js', type: 'module' }
    ],
    reporters: ['mocha'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: ['ChromeHeadlessCI'],
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox',
          '--disable-gpu',
          '--disable-dev-shm-usage'
        ]
      }
    },
    autoWatch: false,
    singleRun: true,
    concurrency: Infinity
  })
}
