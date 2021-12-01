import mock from 'egg-mock';

describe('test/index.test.ts', () => {
  let app: any;
  before(() => {
    app = mock.app({
      baseDir: 'apps/typebox-validate-test',
    });
    return app.ready();
  });

  after(() => app.close());
  afterEach(mock.restore);

  it('should GET /', () => {
    return app.httpRequest().get('/').expect('hi, passportDingtalk').expect(200);
  });
});
