const path = require('path');
const proxyquire = require('proxyquire');
const multer = require('multer');
const R = require('ramda');
const request = require('supertest');
const rewire = require('rewire');
const app = require('../../api/app');

describe('module 2', () => {
  context('router', () => {
    let useSpy;
    let postSpy;

    beforeEach(() => {
      useSpy = sinon.spy();
      postSpy = sinon.spy();
      pathResolveStub = sinon.stub().returns('/root');

      proxyquire('../../api/app', {
        express: sinon.stub().returns({
          get: sinon.spy(),
          post: postSpy,
          set: sinon.spy(),
          use: useSpy,
          listen: sinon.spy(),
        }),
        path: {
          resolve: pathResolveStub,
        },
      });
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should export the router object @export-the-router', () => {
      const router = rewire('../../api/src/router');
      expect(typeof router, 'Did you remember to export the `router`?').to.equal('function');
    });

    it('filename should call the callback with the correct arguments @write-the-filename-handler', () => {
      const router = rewire('../../api/src/router');
      const callbackSpy = sinon.spy();
      let routerFilename;

      try {
        routerFilename = router.__get__('filename');
      } catch (err) {
        throw new Error('Did you define the `filename` function?');
      }

      routerFilename({}, {originalname: 'photo.png'}, callbackSpy);
      const filenameArgs = R.pathOr([], ['firstCall', 'args'], callbackSpy);

      expect(
          filenameArgs[0],
          'Did you pass `null` as the first argument to the callback?'
      ).to.be.null;

      expect(
          'photo.png',
          'Did you remember to pass `file.originalname` as the second argument to the callback?'
      ).to.equal(filenameArgs[1]);
    });

    it('should configure a storage object with multer @configure-disk-storage', () => {
      const stub = sinon.stub(multer, 'diskStorage');
      const router = rewire('../../api/src/router');
      const multerStorage = R.pathOr({}, ['firstCall', 'args', 0], stub);

      expect('api/uploads/', 'Did you pass the right destination to `diskStorage()`').to.equal(multerStorage.destination);

      expect('function', 'Did you pass `filename()` to `diskStorage()`').to.equal(typeof multerStorage.filename);
    });

    it('fileFilter should call the callback with the correct arguments if the photo passes validation @create-the-file-filter', () => {
      const spy = sinon.spy();
      const router = rewire('../../api/src/router');
      const request = {};
      const file = {mimetype: 'image/png'};
      let fileFilter;
      try {
        fileFilter = router.__get__('fileFilter');
      } catch (err) {
        throw new Error('Did you forget to define `fileFilter()`');
      }

      fileFilter(request, file, spy);
      const calledWith = R.pathOr(undefined, ['firstCall', 'args'], spy);

      expect(calledWith[0], 'Did you pass `null` as the first argument to the `callback()`?').to.be.null;
      expect(calledWith[1], 'Did you pass `true` as the second argument to the `callback()`').to.be.true;
    });

    it('fileFilter should call the callback with the correct arguments if the photo fails validation @create-the-file-filter', () => {
      const spy = sinon.spy();
      const router = rewire('../../api/src/router');
      const request = {};
      const file = {mimetype: 'image/jpg'};
      let fileFilter;
      try {
        fileFilter = router.__get__('fileFilter');
      } catch (err) {
        throw new Error('Did you forget to define `fileFilter()`');
      }

      fileFilter(request, file, spy);
      const calledWith = R.pathOr(undefined, ['firstCall', 'args'], spy);

      expect(calledWith[0], 'Did you pass `null` as the first argument to the `callback()`?').to.be.null;

      expect(calledWith[1], 'Did you pass `false` as the second argument to the `callback()`').to.be.false;

      expect(calledWith[2], 'Did you assign the error message to `req.fileFilter()`').to.be.an('error');
      expect(calledWith[2].message, 'Did you assign the error message to `req.fileFilter()`').to.equal('Wrong file type');
    });

    it('should call multer passing in a config object that contains the correct values @define-the-upload-callback', () => {
      const router = rewire('../../api/src/router');
      let upload;

      try {
        upload = router.__get__('upload');
      } catch (err) {
        throw new Error('Did you define the constant `upload`?');
      }
      expect(upload.storage.getFilename, 'Did you pass an object literal with a key of `storage` to `multer()`?').to.be.a('function');
      expect('fileFilter', 'Did you pass an object literal with a key of `fileFilter` to `multer()`?').to.equal(upload.fileFilter.name);
    });

    it('should pass the router to app.use @wire-up-the-router', () => {
      expect(
          '/',
          'Did you pass the route `\'/\'` as the first argument to `app.use()`?'
      ).to.equal(R.pathOr(undefined, ['firstCall', 'args', 0], useSpy));

      expect(
          'router',
          'did you pass the `router` as the second argument to `app.use()`?'
      ).to.equal(R.pathOr(undefined, ['firstCall', 'args', 1, 'name'], useSpy));
    });


    it('should serve static files @serve-static-files', () => {
      expect(
          path.resolve(__dirname, '../../api'),
          'Did you pass `__dirname` as the first argument to `path.resolve()`?'
      ).to.equal(R.pathOr(undefined, ['secondCall', 'args', 0], pathResolveStub));

      expect(
          'uploads',
          'Did you pass `\'../client/index.html\'` as the second argument to `path.resolve()`?'
      ).to.equal(R.pathOr(undefined, ['secondCall', 'args', 1], pathResolveStub));

      expect(
          'serveStatic',
          'Did you pass a call to `express.static()` to `app.use()`'
      ).to.equal(R.pathOr(undefined, ['secondCall', 'args', 0, 'name'], useSpy));
    });

    it('should make a post request that fails validation and receives a 400 @create-the-upload-route', async () => {
      let resp;
      try {
        const response = await request(app)
            .post('/upload')
            .attach('photo', path.resolve(__dirname, './ullr.jpg'))
            .expect((res) => {
              resp = res;
            });
      } catch (err) {
        throw new Error('Did you remember to call `router.post()`, passing in `\'/upload\'`?');
      }
      if (resp.status === 201) {
        throw new Error('Did you remember to pass `upload.single()` as the second argument to `router.post()`?');
      }
      expect(resp.body.error, 'Did you implement the callback correctly if there is a `fileValidationError`?').to.equal('Wrong file type');
    });

    it('should make a successful post request that returns a 201 @respond-with-a-201', async () => {
      try {
        await request(app)
            .post('/upload')
            .attach('photo', path.resolve(__dirname, '../../client/photos/ullr.png'))
            .expect(201);
      } catch (err) {
        throw new Error('Did you implement the callback correctly if there is no `fileValidationError`?');
      }
    });
  });
});
