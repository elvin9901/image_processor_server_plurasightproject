const gm = require('gm');

const { parentPort, workerData } = require('worker_threads');



gm(workerData.source)
    .resize(100, 100)
    .write(workerData.destination, (err) => {
        if (err) {
            throw err;

        }
        parentPort.postMessage({ resized: true })
    });