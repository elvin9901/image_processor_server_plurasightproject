const { parentPort } = require('worker_threads')

setTimeout(() => {
  parentPort.postMessage('woohoo')
}, 75)
