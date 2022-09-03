const { parentPort } = require('worker_threads')

parentPort.postMessage({ monochrome: true})
