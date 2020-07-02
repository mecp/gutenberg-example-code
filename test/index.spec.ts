// tslint:disable-next-line no-import-side-effect
import { assert } from 'chai';

describe('./src/index.spec.ts', () => {
  it('dummy', (done) => {
    Promise.resolve(1 + 2)
      .then((result: number) => {
        assert.equal(result, 3);
        done();
      })
      .catch(done);
  });
});
