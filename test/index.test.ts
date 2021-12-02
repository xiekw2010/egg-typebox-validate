import mock from 'egg-mock';
import * as assert from 'assert';

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

  it('should POST 200 /:id', async () => {
    const res = await app.httpRequest().post('/someId').send({
      name: 'xiekw2010',
      description: 'desc',
      email: 'xiekw2010@gmail.com',
    });
    assert(res.status === 200);
    assert(res.body.n === 'xiekw2010');
    assert(res.body.d === 'desc');
    assert(res.body.e === 'xiekw2010@gmail.com');
    assert(res.body.same === true);
  });

  it('should POST 422 /:id', async () => {
    const res = await app.httpRequest().post('/someId').send({
      name: 'xiekw2010',
      email: 'xiekw2010gmail.com',
    });
    assert(res.status === 422);
  });
});
