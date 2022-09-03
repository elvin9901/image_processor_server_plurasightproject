const gm = require('gm');
const { parentPort, workerData } = require('worker_threads');

gm(workerData.source).monochrome().write(workerData.destination, (err) => {
    if (err) {
        throw err;
    }
    parentPort.postMessage({
        monochrome: true
    })
});



