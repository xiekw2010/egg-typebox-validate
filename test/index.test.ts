import * as assert from 'assert';
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

  it('should POST 200 /:id trim', async () => {
    const res = await app.httpRequest().post('/someId').send({
      name: 'xiekw2010',
      description: 'desc  ',
      email: 'xiekw2010@gmail.com',
    });
    assert(res.status === 200);
    assert(res.body.n === 'xiekw2010');
    assert(res.body.d === 'desc');
    assert(res.body.e === 'xiekw2010@gmail.com');
    assert(res.body.same === true);
  });

  it('should POST 200 /:id custom format number bype', async () => {
    let res = await app.httpRequest().post('/someId').send({
      name: 'xiekw2010',
      description: 'desc  ',
      email: 'xiekw2010@gmail.com',
      byte: 4,
    });
    assert(res.status === 200);
    assert(res.body.same === true);

    res = await app.httpRequest().post('/someId').send({
      name: 'xiekw2010',
      description: 'desc  ',
      email: 'xiekw2010@gmail.com',
      byte: 256,
    });
    assert(res.status === 422);
  });

  it('should POST 200 /:id custom format string json-string', async () => {
    let res = await app.httpRequest().post('/someId').send({
      name: 'xiekw2010',
      description: 'desc  ',
      email: 'xiekw2010@gmail.com',
      jsonString: '{"a":1}',
    });
    assert(res.status === 200);
    assert(res.body.same === true);

    res = await app.httpRequest().post('/someId').send({
      name: 'xiekw2010',
      description: 'desc  ',
      email: 'xiekw2010@gmail.com',
      jsonString: 'a{"a":1}',
    });
    assert(res.status === 422);
  });

  it('should POST 200 /:id custom format string semver', async () => {
    let res = await app.httpRequest().post('/someId').send({
      name: 'xiekw2010',
      description: 'desc  ',
      email: 'xiekw2010@gmail.com',
      version: '1.0.0',
    });
    assert(res.status === 200);
    assert(res.body.same === true);

    res = await app.httpRequest().post('/someId').send({
      name: 'xiekw2010',
      description: 'desc  ',
      email: 'xiekw2010@gmail.com',
      version: 'a.b.c',
    });
    assert(res.status === 422);
  });
});
