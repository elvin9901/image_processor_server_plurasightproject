const path = require('path');
const { Worker, isMainThread } = require('worker_threads');


/**Resolve the path to the resize worker
Define a constant before the imageProcessor() function called pathToResizeWorker. Assign a call to path.resolve() to it. 
Pass in __dirname as the first argument, and 'resizeWorker.js' as the second. */
const pathToResizeWorker = path.resolve(__dirname, 'resizeWorker.js');



/**
 * Resolve the path to the monochrome worker
Define a constant before the imageProcessor() function called pathToMonochromeWorker.
 Assign a call to path.resolve() to it. Pass in __dirname as the first parameter, and 'monochromeWorker.js'
  as the second.
 * 
 */
const pathToMonochromeWorker = path.resolve(__dirname, 'monochromeWorker.js');




/**
 * Create the upload path resolver function
Define a function called uploadPathResolver(). Pass in the parameter filename. 
It should return a call to path.resolve() passing in __dirname, '../uploads', and filename.
 */
const uploadPathResolver = (filename) => {

    return path.resolve(__dirname, '../uploads', filename);
};


/**
 * 
 * Define the source path
Let's head back to the imageProcessor() function. Pass a parameter called filename to imageProcessor(). 
Define a constant called sourcePath within the imageProcessor() function. 
Assign a call to uploadPathResolver() to sourcePath, pass in the filename argument.
 */

const imageProcessor = (filename) => {
    const sourcePath = uploadPathResolver(filename);
    const resizedDestination = uploadPathResolver('resized-' + filename);
    const monochromeDestination = uploadPathResolver('monochrome-' + filename);
    let resizeWorkerFinished = false;
    let monochromeWorkerFinished = false;


    /**Inside the if block within our promise, let's create a try/catch statement. 
     * Inside the try, assign to a constant called resizeWorker a new instantiation of the Worker() class.
     *  Pass in pathToResizeWorker as the first argument. The second argument should be an object literal,
     *  with a key of workerData and a value that is another object literal.
     *  Within the workerData object, define a key called source with our sourcePath constant as the value.
     *  Define another key in workerData called destination, and assign to it our resizedDestination constant.
     *  Inside the catch, call reject() passing in the error. */
    return new Promise((resolve, reject) => {
        if (isMainThread) {
            try {
                const resizeWorker = new Worker(pathToResizeWorker, {
                    workerData: {
                        source: sourcePath,
                        destination: resizedDestination,
                    },
                });


                const monochromeWorker = new Worker(pathToMonochromeWorker, {
                    workerData: {
                        source: sourcePath,
                        destination: monochromeDestination,
                    },
                });

                resizeWorker.on('message', (message) => {
                    resizeWorkerFinished = true;
                    if (monochromeWorkerFinished) {
                        resolve('resizeWorker finished processing');
                    }
                });

                resizeWorker.on('error', (error) => {
                    reject(new Error(error.message));
                });

                resizeWorker.on('exit', (code) => {
                    if (code !== 0) {
                        reject(new Error('Exited with status code ' + code));
                    }
                });

                monochromeWorker.on('message', (message) => {
                    monochromeWorkerFinished = true;
                    if (resizeWorkerFinished) {
                        resolve('monochromeWorker finished processing');
                    }
                });

                monochromeWorker.on('error', (error) => {
                    reject(new Error(error.message));
                });

                monochromeWorker.on('exit', (code) => {
                    if (code !== 0) {
                        reject(new Error('Exited with status code ' + code));
                    }
                });
            } catch (error) {
                reject(error);
            }
        } else {
            reject(new Error('not on main thread'));
        }
    });
};

module.exports = imageProcessor;