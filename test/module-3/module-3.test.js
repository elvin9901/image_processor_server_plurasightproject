const path = require('path');
const proxyquire = require('proxyquire').noCallThru();
const R = require('ramda');
const multer = require('multer');
const request = require('supertest');
const rewire = require('rewire');
const express = require('express');
const app = require('../../api/app');
const {JSDOM} = require('jsdom');

describe('module 3', () => {
  let ullrImg;
  let writeStub;
  let resizeStub;
  let postMessageStub;
  let gmStub;

  beforeEach((done) => {
    JSDOM.fromFile(path.resolve(__dirname, '../../client', 'photo-viewer.html'))
        .then((dom) => {
          ullrImg = dom.window.document.getElementsByTagName('img')[0];
          done();
        });
  });

  afterEach(() => {
    sinon.restore();
  });

  it('router should resolve the correct path and save it to the photoPath @resolve-the-path-to-the-photo-viewer', () => {
    const router = rewire('../../api/src/router');
    let photoPath;
    try {
      photoPath = router.__get__('photoPath');
    } catch (err) {
      throw new Error('Did you define the `photoPath`?');
    }

    expect(path.resolve(__dirname, '../../client/photo-viewer.html'), 'Did you call `path.resolve()` passing in `__dirname` and `\'../../client/photo-viewer.html\'`?').to.equal(photoPath);
  });

  it('router should make a successful get request that returns a 200 and the photo-viewer.html page @create-the-photo-viewer-get-route', async () => {
    let response;
    try {
      response = await request(app)
          .get('/photo-viewer')
          .expect(200)
          .expect('Content-Type', /html/);
    } catch (err) {
      throw new Error('Did you pass `\'/photo-viewer\'` to `router.get()`?');
    }

    expect(response.text.includes('Photo Viewer'), 'Did you call `response.sendFile()` in the callback that\'s passed to `router.get()`? \n Did you pass the correct path to `router.get()`').to.be.true;
  });

  it('photo-viewer.html should add an img tag with an src of ullr.png to photo-viewer.html @add-an-image', () => {
    expect(
        'ullr.png',
        'Did you add an `<img>` with an `src` attribute equal to `\'ullr.png\'`?'
    ).to.equal(R.pathOr(undefined, ['attributes', 'src', 'value'], ullrImg));
  });

  context('resizeWorker', () => {
    beforeEach(() => {
      appSpy = sinon.spy();
      writeStub = sinon.stub();
      resizeStub = sinon.stub().returns({
        write: writeStub,
      });
      postMessageStub = sinon.stub();
      gmStub = sinon.stub().returns({
        'resize': resizeStub,
        '@noCallThru': true,
      });

      proxyquire('../../api/src/resizeWorker', {
        worker_threads: {
          workerData: {
            source: 'path-to-image',
            destination: 'destination-of-image',
          },
          parentPort: {
            postMessage: postMessageStub,
          },
        },
        gm: gmStub,
      });
    });

    it('should pass workerData.source to gm @create-the-resize-worker', () => {
      expect('path-to-image', 'Did you call `gm()` passing in `workerData.source` in `resizeWorker.js`?').to.equal(R.pathOr(undefined, ['firstCall', 'args', 0], gmStub));
    });

    it('should chain a call to resize off gm passing in 100 as the first and second arg @resize-the-photo', () => {
      expect(
          100,
          'Did you pass `100` as the first argument to the call to `resize()` which is chained off of `gm()`?'
      ).to.equal(R.pathOr(undefined, ['firstCall', 'args', 0], resizeStub));

      expect(
          100,
          'Did you pass `100` as the second argument to the call to `resize()` which is chained off of `gm()`?'
      ).to.equal(R.pathOr(undefined, ['firstCall', 'args', 1], resizeStub));
    });

    it('should chain a call to `write()` off of resize passing in the workerData.destination and a callback @write-the-resized-image', () => {
      expect('destination-of-image', 'Did you pass `workerData.destination` as the first argument to the chained call to `write()`?').to.equal(R.pathOr(undefined, ['firstCall', 'args', 0], writeStub));
      expect(
          'function',
          'Did you pass in an anonymous function to the chained call of `write()`?'
      ).to.equal(typeof writeStub.firstCall.args[1]);
    });

    it('should throw errors passed to the callback passed into write @handle-resize-errors', () => {
      expect(
          () => writeStub.firstCall.args[1](new Error('Error in resize')),
          'Did you check for errors and throw them from the callback we passed to `write()`?'
      ).to.throw(Error, 'Error in resize');
    });

    it('should post a message on the parent port if no errors are thrown @send-a-message-from-resize-worker', () => {
      writeStub.firstCall.args[1]();
      expect(
          {resized: true},
          'Did you call `parentPort.postMessage()` if there are no errors? Did you pass `{ resized: true }` to it?'
      ).to.eql(R.pathOr(undefined, ['firstCall', 'args', 0], postMessageStub));
    });
  });

  context('monochromeWorker', () => {
    beforeEach(() => {
      appSpy = sinon.spy();
      writeStub = sinon.stub();
      monochromeStub = sinon.stub().returns({
        write: writeStub,
      });
      postMessageStub = sinon.stub();
      gmStub = sinon.stub().returns({
        'monochrome': monochromeStub,
        '@noCallThru': true,
      });

      proxyquire('../../api/src/monochromeWorker', {
        worker_threads: {
          workerData: {
            source: 'path-to-image',
            destination: 'destination-of-image',
          },
          parentPort: {
            postMessage: postMessageStub,
          },
        },
        gm: gmStub,
      });
    });
    it('should pass workerData.source to gm @create-the-monochrome-worker', () => {
      expect(
          'path-to-image',
          'Did you call `gm()` passing in `workerData.source` in `monochromeWorker.js`?'
      ).to.equal(R.pathOr(undefined, ['firstCall', 'args', 0], gmStub));
    });

    it('should chain a call to monochrome @convert-the-image-to-monochrome', () => {
      expect(monochromeStub.calledOnce, 'Did you chain a call of `monochrome()` off of `gm()`?').to.be.true;
    });

    it('should chain a call to `write()` off of monochrome passing in the workerData.destination and a callback @write-the-monochrome-image', () => {
      expect(
          'destination-of-image',
          'Did you pass `workerData.destination` as the first argument to the chained call to `write()`?'
      ).to.equal(R.pathOr(undefined, ['firstCall', 'args', 0], writeStub));

      expect(
          'function',
          'Did you pass in an anonymous function to the chained call of `write()`?'
      ).to.equal(typeof writeStub.firstCall.args[1]);
    });

    it('should throw errors passed to the callback passed into write @handle-monochrome-errors', () => {
      expect(
          () => writeStub.firstCall.args[1](new Error('Error in monochrome')),
          'Did you check for errors and throw them from the callback we passed to `write()`?'
      ).to.throw(Error, 'Error in monochrome');
    });

    it('should post a message on the parent port if no errors are thrown @send-a-message-from-monochrome-worker', () => {
      writeStub.firstCall.args[1]();
      expect(
          {monochrome: true},
          'Did you call `parentPort.postMessage()` if there are no errors? Did you pass `{ monochrome: true }` to it?'
      ).to.eql(R.pathOr(undefined, ['firstCall', 'args', 0], postMessageStub));
    });
  });
});
