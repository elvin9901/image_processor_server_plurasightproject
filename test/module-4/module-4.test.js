const assert = require('assert');
const fs = require('fs');
const path = require('path');
const proxyquire = require('proxyquire').noCallThru();
const R = require('ramda');
const request = require('supertest');
const rewire = require('rewire');
const {JSDOM} = require('jsdom');
const imageProcessor = require('../../api/src/imageProcessor');
const app = require('../../api/app');

describe('module 4', () => {
  context('imageProcessor.js', () => {
    it('You should export the image processor function @create-the-image-processor', () => {
      expect(typeof imageProcessor, 'Did you remember to export the `imageProcessor()`?').to.equal('function');
    });

    it('the image processor function should return a promise @instantiate-a-promise', async () => {
      try {
        const x = proxyquire('../../api/src/imageProcessor', {
          worker_threads: {
            isMainThread: false,
          },
        });

        await assert.rejects(
            x('fsaf'),
            new Error('not on main thread'),
            'Did you reject the promise if it\'s not on the main thread? Did you pass the correct message?'
        );
      } catch (err) {
        if (err.code === 'ERR_ASSERTION') {
          throw err;
        }
        throw new Error('Did you return a promise from the `imageProcessor()`?');
      }
    });

    it('should assign a call to path.resolve to the constant pathToResizeWorker @resolve-the-resize-worker', () => {
      const pathStub = sinon.stub();
      proxyquire('../../api/src/imageProcessor', {
        path: {
          resolve: pathStub,
        },
      });

      expect(
          path.resolve(__dirname + '../../../api/src'),
          'Did you pass `__dirname` to `path.resolve()`?'
      ).to.equal(R.pathOr(undefined, ['firstCall', 'args', 0], pathStub));

      expect(
          'resizeWorker.js',
          'Did you pass `\'resizeWorker.js\'` to `path.resolve()`?'
      ).to.equal(R.pathOr(undefined, ['firstCall', 'args', 1], pathStub));
    });

    it('should assign a call to path.resolve to the constant pathToMonochromeWorker @resolve-the-monochrome-worker', () => {
      const pathStub = sinon.stub();
      proxyquire('../../api/src/imageProcessor', {
        path: {
          resolve: pathStub,
        },
      });

      expect(
          path.resolve(__dirname + '../../../api/src'),
          'Did you pass `__dirname` to `path.resolve()`?'
      ).to.equal(R.pathOr(undefined, ['secondCall', 'args', 0], pathStub));

      expect(
          'monochromeWorker.js',
          'Did you pass `\'monochromeWorker.js\'` to `path.resolve()`?'
      ).to.equal(R.pathOr(undefined, ['secondCall', 'args', 1], pathStub));
    });

    it('should define a function uploadPathResolver that takes a filename as it\s argument @create-upload-path-resolver', () => {
      let uploadPathResolver;
      try {
        uploadPathResolver = rewire('../../api/src/imageProcessor').__get__('uploadPathResolver');
      } catch (err) {
        throw new Error('Did you remember to define the `uploadPathResolver()`?');
      }
      const expected = uploadPathResolver('kittens.png');

      expect(
          path.resolve(__dirname + '../../../api/uploads/kittens.png'),
          'Did you return a call to `path.resolve()` with the correct arguments?'
      ).to.equal(expected);
    });

    it('should assign a call to uploadPathResolver to a constant @define-the-source-path', async () => {
      const pathStub = sinon.stub();
      const imageProcessorProxy = proxyquire('../../api/src/imageProcessor', {
        'path': {
          resolve: pathStub,
        },
        'worker_threads': {
          Worker: sinon.stub(),
          isMainThread: false,
        },
        '@noCallThru': true,
      });

      try {
        await imageProcessorProxy('moarKittens.png');
      } catch (err) {
        // do nothing
      }

      expect(
          'moarKittens.png',
          'Did you pass in the `filename` argument to `uploadPathResolver()`?',
      ).to.equal(R.pathOr(undefined, ['thirdCall', 'args', 2], pathStub));
    });

    it('should assign a call to uploadPathResolver to a constant passing in resized- concatenated with the filename @define-resized-destination', async () => {
      const pathStub = sinon.stub();
      const imageProcessorProxy = proxyquire('../../api/src/imageProcessor', {
        'path': {
          resolve: pathStub,
        },
        'worker_threads': {
          Worker: sinon.stub(),
          isMainThread: false,
        },
        '@noCallThru': true,
      });

      try {
        await imageProcessorProxy('moarKittens.png');
      } catch (err) {
        // do nothing
      }

      const pathStubCall = pathStub.getCall(3);
      expect(
          'resized-moarKittens.png',
          'Did you concatenate `\'resized-\'` with `filename`?',
      ).to.equal(R.pathOr(undefined, ['args', 2], pathStubCall));
    });

    it('should assign a call to uploadPathResolver to a constant passing in monochrome- concatenated to the filename @define-monochrome-destination', async () => {
      const pathStub = sinon.stub();
      const imageProcessorProxy = proxyquire('../../api/src/imageProcessor', {
        'path': {
          resolve: pathStub,
        },
        'worker_threads': {
          Worker: sinon.stub(),
          isMainThread: false,
        },
        '@noCallThru': true,
      });

      try {
        await imageProcessorProxy('moarKittens.png');
      } catch (err) {
        // do nothing
      }

      const pathStubCall = pathStub.getCall(4);
      expect(
          'monochrome-moarKittens.png',
          'Did you concatenate `\'monochrome-\'` with `filename`?',
      ).to.equal(R.pathOr(undefined, ['args', 2], pathStubCall));
    });

    it('should assign an instantiation of the Worker class to a constant representing the resizeWorker @instantiate-the-resize-worker', async () => {
      const imageProcessor = rewire('../../api/src/imageProcessor');
      imageProcessor.__set__('pathToResizeWorker', path.resolve('./test/module-4/resizeStub.js'));
      imageProcessor.__set__('pathToMonochromeWorker', path.resolve('./test/module-4/resizeStub.js'));

      const workerStub = sinon.stub();
      const imageProcessorProxy = proxyquire('../../api/src/imageProcessor', {
        worker_threads: {
          'Worker': workerStub,
          'isMainThread': true,
          '@noCallThru': true,
        },
      });

      try {
        await imageProcessorProxy('hereIsTheFile.png');
      } catch (err) {
        // do nothing
      }

      expected = [
        path.resolve(__dirname, '../../api/src/resizeWorker.js'),
        {
          workerData: {
            source: path.resolve(__dirname, '../../api/uploads/hereIsTheFile.png'),
            destination: path.resolve(__dirname, '../../api/uploads/resized-hereIsTheFile.png'),
          },
        }];

      const workerStubCall = workerStub.getCall(0);
      expect(
          expected,
          'Did you pass `pathToResizeWorker` and the config object to a new instantiation of the `Worker()` class?'
      ).to.eql(R.pathOr(undefined, ['args'], workerStubCall));
    });

    it('should assign an instantiation of the Worker class to a constant representing the monochromeWorker @instantiate-the-monochrome-worker', async () => {
      const workerStub = sinon.stub();
      const imageProcessorProxy = proxyquire('../../api/src/imageProcessor', {
        worker_threads: {
          Worker: workerStub,
          isMainThread: true,
        },
      });

      try {
        await imageProcessorProxy('hereIsTheFile.png');
      } catch (err) {

      }

      expected = [
        path.resolve(__dirname, '../../api/src/monochromeWorker.js'),
        {
          workerData: {
            source: path.resolve(__dirname, '../../api/uploads/hereIsTheFile.png'),
            destination: path.resolve(__dirname, '../../api/uploads/monochrome-hereIsTheFile.png'),
          },
        }];

      const workerStubCall = workerStub.getCall(1);
      expect(
          expected,
          'Did you pass `pathToMonochromeWorker` and the config object to a new instantiation of the `Worker()` class?'
      ).to.eql(R.pathOr(undefined, ['args'], workerStubCall));
    });

    it('should resolve the promise on resizeWorker\'s \'message\' event @resize-on-message', async () => {
      let result;

      const imageProcessor = rewire('../../api/src/imageProcessor');
      imageProcessor.__set__('pathToResizeWorker', path.resolve('./test/module-4/resizeWorkerProxy.js'));
      imageProcessor.__set__('pathToMonochromeWorker', path.resolve('./test/module-4/monochromeFast.js'));

      try {
        result = await imageProcessor('ullr.png');
      } catch (err) {
        // do nothing
      }

      return expect(
          result,
          'Did you register an `on(\'message\')` event listener for the resizeWorker that resolves the promise?'
      ).to.equal('resizeWorker finished processing');
    });

    it('should reject the promise on resizeWorker\'s \'error\' event @resize-error-event', async () => {
      const imageProcessor = rewire('../../api/src/imageProcessor');
      let errorThrown;
      imageProcessor.__set__('pathToResizeWorker', path.resolve('./test/module-4/resizeWorkerProxyError.js'));
      imageProcessor.__set__('pathToMonochromeWorker', path.resolve('./test/module-4/monochromeStub.js'));

      try {
        await imageProcessor('ullr.png');
      } catch (err) {
        errorThrown = true;
        expect(
            'Error from worker thread',
            'Did you register an `on(\'error\')` event listener for the resizeWorker that rejects the promise?'
        ).to.eql(err.message);
      } finally {
        if (!errorThrown) {
          throw new Error('Did you register an `on(\'error\')` event listener for the resizeWorker that rejects the promise?');
        }
      }
    });

    it('should reject the promise on resizeWorker\'s \'exit\' event when process exit\'s  > 0 @resize-exit-event', async () => {
      const imageProcessor = rewire('../../api/src/imageProcessor');
      let errorThrown = false;
      let finishedProcessing = false;

      setTimeout(() => {
        if (!errorThrown && !finishedProcessing) {
          throw new Error('Did you register an `on(\'exit\')` event listener for the resizeWorker that rejects the promise?');
        }
      }, 2000);

      imageProcessor.__set__('pathToResizeWorker', path.resolve('./test/module-4/resizeWorkerProxyExitCode1.js'));
      imageProcessor.__set__('pathToMonochromeWorker', path.resolve('./test/module-4/monochromeStub.js'));

      try {
        await imageProcessor('ullr.png');
        finishedProcessing = true;
      } catch (err) {
        errorThrown = true;
        expect(
            'Exited with status code 1',
            'Did you register an `on(\'exit\')` event listener for the resizeWorker that rejects the promise?'
        ).to.eql(err.message);
      } finally {
        if (!errorThrown) {
          errorThrown = true;
          throw new Error('Did you register an `on(\'exit\')` event listener for the resizeWorker that rejects the promise?');
        }
      }
    });

    it('should resolve the promise on monochromeWorker\'s \'message\' event @monochrome-message-event', async () => {
      const imageProcessor = rewire('../../api/src/imageProcessor');
      imageProcessor.__set__('pathToMonochromeWorker', path.resolve('./test/module-4/resizeWorkerProxy.js'));
      imageProcessor.__set__('pathToResizeWorker', path.resolve('./test/module-4/monochromeFast.js'));

      try {
        result = await imageProcessor('ullr.png');
      } catch (err) {
        // do nothing
      }

      return expect(
          result,
          'Did you register an `on(\'message\')` event listener for the monochromeWorker that resolves the promise?'
      ).to.equal('monochromeWorker finished processing');
    });

    it('should reject the promise on monochromeWorker\'s \'error\' event @monochrome-error-event', async () => {
      const imageProcessor = rewire('../../api/src/imageProcessor');
      let errorThrown;
      imageProcessor.__set__('pathToMonochromeWorker', path.resolve('./test/module-4/resizeWorkerProxyError.js'));
      imageProcessor.__set__('pathToResizeWorker', path.resolve('./test/module-4/monochromeStub.js'));

      try {
        await imageProcessor('ullr.png');
      } catch (err) {
        errorThrown = true;
        expect(
            'Error from worker thread',
            'Did you register an `on(\'error\')` event listener for the monochromeWorker that rejects the promise?'
        ).to.eql(err.message);
        // do nothing
      } finally {
        if (!errorThrown) {
          throw new Error('Did you register an `on(\'error\')` event listener for the monochromeWorker that rejects the promise?');
        }
      }
    });

    it('should reject the promise on monochromeWorker\'s \'exit\' event when process exit\'s > 0 @monochrome-exit-event', async () => {
      const imageProcessor = rewire('../../api/src/imageProcessor');
      let errorThrown = false;
      let finishedProcessing = false;

      setTimeout(() => {
        if (!errorThrown && !finishedProcessing) {
          throw new Error('Did you register an `on(\'exit\')` event listener for the monochromeWorker that rejects the promise?');
        }
      }, 2000);
      imageProcessor.__set__('pathToMonochromeWorker', path.resolve('./test/module-4/resizeWorkerProxyExitCode1.js'));
      imageProcessor.__set__('pathToResizeWorker', path.resolve('./test/module-4/monochromeStub.js'));

      try {
        await imageProcessor('ullr.png');
        finishedProcessing = true;
      } catch (err) {
        errorThrown = true;
        expect(
            'Exited with status code 1',
            'Did you register an `on(\'exit\')` event listener for the monochromeWorker that rejects the promise?'
        ).to.eql(err.message);
      } finally {
        if (!errorThrown) {
          errorThrown = true;
          throw new Error('Did you register an `on(\'exit\')` event listener for the monochromeWorker that rejects the promise?');
        }
      }
    });
  });

  context('router.js', async () => {
    const directory = path.resolve(__dirname + '../../../api/uploads');

    it('should add a call to imageProcessor passing in the image in our post request @invoke-the-image-processor', async () => {
      let files = fs.readdirSync(directory);

      for (const file of files) {
        fs.unlinkSync(directory +'/' + file);
      }


      await request(app)
          .post('/upload')
          .attach('photo', path.resolve(__dirname, '../../client/photos/ullr.png'))
          .expect(201);

      files = fs.readdirSync(directory);

      expect(files.includes('ullr.png'), 'Did you call `imageProcessor()` inside the `\'/upload\'` route?').to.be.true;
      expect(files.includes('resized-ullr.png'), 'Did you call `imageProcessor()` inside the `\'/upload\'` route?').to.be.true;
      expect(files.includes('monochrome-ullr.png'), 'Did you call `imageProcessor()` inside the `\'/upload\'` route?').to.be.true;
    });
  });

  context('photo-viewer.html', () => {
    let images;
    beforeEach((done) => {
      JSDOM.fromFile(path.resolve(__dirname, '../../client', 'photo-viewer.html'))
          .then((dom) => {
            images = dom.window.document.getElementsByTagName('img');
            done();
          });
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should add an img tag with an src of monochrome-ullr.png @add-monochrome-image', () => {
      expect(
          'monochrome-ullr.png',
          'Did you add an `<img>` with an `src` of `\'monochrome-ullr.png\'` to the photo-viewer?'
      ).to.equal(R.pathOr(undefined, [1, 'attributes', 'src', 'value'], images));
    });

    it('should add an img tag with an src of resized-ullr.png @add-resized-image', () => {
      expect(
          'resized-ullr.png',
          'Did you add an `<img>` with an `src` of `\'resized-ullr.png\'` to the photo-viewer?'
      ).to.equal(R.pathOr(undefined, [2, 'attributes', 'src', 'value'], images));
    });
  });
});

