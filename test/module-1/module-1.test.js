const path = require('path');
const proxyquire = require('proxyquire');
const request = require('supertest');
const jsdom = require('jsdom');
const app = require('../../api/app');
const assert = require('assert');
const R = require('ramda');
const {JSDOM} = jsdom;

describe('module 1', () => {
  context('index.html', () => {
    let form;
    let fileInput;
    let submitButton;

    beforeEach((done) => {
      jsdomError = undefined;
      JSDOM.fromFile(path.resolve(__dirname, '../../client', 'index.html'))
          .then((dom) => {
            form = dom.window.document.getElementsByTagName('form')[0];
            fileInput = form.children[0];
            submitButton = form.children[1];
            done();
          })
          .catch((err) => {
            jsdomError = err;
            done();
          });
    });

    context('Form', () => {
      it('has a form tag @has-form-tag', () => {
        expect(form, '`index.html` does not contain a `form` tag').to.exist;
      });

      it('has a post method @set-the-encoding', () => {
        expect(
            'post',
            'the `form` does not have a `method` of `post`'
        ).to.equal(R.pathOr(undefined, ['attributes', 'method', 'value'], form));
      });

      it('has an enctype attribute with a value of multipart/form-data @set-the-encoding', () => {
        expect(
            'multipart/form-data',
            'the `form` does not have an `enctype` of `multipart/form-data`'
        ).to.equal(R.pathOr(undefined, ['attributes', 'enctype', 'value'], form));
      });

      it('has an action attribute with a value of /upload @set-the-encoding', () => {
        expect(
            '/upload',
            'the `form` does not have an `action` of `/upload`'
        ).to.equal(R.pathOr(undefined, ['attributes', 'action', 'value'], form));
      });
    });

    context('File Input', () => {
      it('has an input tag with a class of file-input @add-an-input', () => {
        expect(
            'file-input',
            'the `form` does not contain an `input` with a `class` name  of `file-input`'
        ).to.equal(R.pathOr(undefined, ['className'], fileInput));
      });

      it('has a type attribute with a value of file @add-an-input', () => {
        expect(
            'file',
            'the `input` does not have a `type` with a value of `file`'
        ).to.equal(R.pathOr(undefined, ['attributes', 'type', 'value'], fileInput));
      });

      it('has a name attribute with a value of photo @add-an-input', () => {
        expect(
            'photo',
            'the `input` does not have a `name` with a value of `photo`'
        ).to.equal(R.pathOr(undefined, ['attributes', 'name', 'value'], fileInput));
      });
    });

    context('Submit Button', () => {
      it('has an input tag with a class of submit-button @add-a-submit-button', () => {
        expect(
            'submit-button',
            'the `form` does not contain an `input` tag with a `class` name of `submit-button`'
        ).to.equal(R.pathOr(undefined, ['className'], submitButton));
      });

      it('has a type attribute with a value of submit @add-a-submit-button', () => {
        expect(
            'submit',
            'the `submit-button` does not have a `type` with a value of `submit`'
        ).to.equal(R.pathOr(undefined, ['attributes', 'type', 'value'], submitButton));
      });

      it('has a value attribute with a value of Submit @add-a-submit-button', () => {
        expect(
            'Submit',
            'the `submit-button` does not have a `value` attribute with a value of `Submit`'
        ).to.equal(R.pathOr(undefined, ['attributes', 'value', 'value'], submitButton));
      });
    });
  });

  context('app.js unit tests', () => {
    let useSpy;
    let staticStub;
    let pathResolveStub;

    beforeEach(() => {
      useSpy = sinon.spy();
      pathResolveStub = sinon.stub().returns('/root');
      staticStub = sinon.stub();

      proxyquire('../../api/app', {
        express: sinon.stub().returns({
          use: useSpy,
        }),
        path: {
          resolve: pathResolveStub,
        },
      });
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should save the results of calling path.resolve to a constant @respond-with-the-form', () => {
      expect(
          path.resolve(__dirname, '../../api'),
          'Did you pass `__dirname` as the first argument to `path.resolve()`?'
      ).to.equal(R.pathOr(undefined, ['firstCall', 'args', 0], pathResolveStub));

      expect(
          '../client/index.html',
          'Did you pass `\'../client/index.html\'` as the second argument to `path.resolve()`?'
      ).to.equal(R.pathOr(undefined, ['firstCall', 'args', 1], pathResolveStub));
    });


    it('app.use should be called with /* as it\'s route @respond-with-the-form', () => {
      expect(useSpy.calledWith('/*'), 'Did you pass `/*` as the first argument to `app.use()`?').to.be.true;
    });
  });

  context('app.js integration tests', () => {
    it('instantiates an express app @export-the-app', () => {
      expect(typeof app, 'did you remember to export the app?').to.equal('function');
    });

    it('should serve our html file @respond-with-the-form', async () => {
      try {
        await request(app)
            .get('/')
            .expect(200)
            .expect('Content-Type', /html/);
      } catch (err) {
        throw new assert.AssertionError({message: 'did you call `response.sendFile()` with the correct argument inside the callback?'});
      }
    });
  });
});
