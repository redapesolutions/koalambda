import {kompose, kWithUserId, kMapProperty, kJsonBody} from '../lib'
import { expect } from 'chai'
import noop from 'lodash/noop'

describe('Middleware framework', () => {
  describe('kompose function', () => {
    it('returns a function', () => {
      expect(kompose((c) => Promise.resolve('x'))).to.be.a('Function')
    })
    it('combines lambda s event and context into a single argument', () => {
      const a = {msg: 'I am "a"'}, b = {msg: 'I am "b"'}
      const fn = kompose(
        (arg) => {
          expect(arg).to.have.property('context').which.equals(b)
          expect(arg).to.have.property('event').which.equals(a)
          return Promise.resolve(0)
        }
      )
      return fn(a,b)
    })
    it('only accepts functions', () => {
      expect(() => kompose(42)).to.throw()
    }),
    describe('Expected behavior follows Koa', () => {
      it('follows the path of the functions', (done) => {
        kompose(
          async(ctx, next) => {
            expect(ctx.event).to.not.have.property('steps')
            ctx.event.steps = 1
            await next()
            expect(ctx.event.steps).to.equal(2)
            return 3
          },
          async(ctx, next) => {
            expect(ctx.event.steps).to.equal(1)
            ctx.event.steps = 2
            await next()
          }
        )({},{}).then(x => {
          expect(x).to.equal(3)
          done()
        })
      })
    })
  })
  describe('kJsonBody middleware', () => {
    it('should parse the json body and put it onto event s body', async () => {
      const ctx = {
        event: {
          body: JSON.stringify({a:42})
        }
      }
      await kJsonBody(ctx, noop)
      expect(ctx.event.body).to.be.an('Object').which.has.property('a')
    })
    it('should raise if body is not valid JSON', async () => {
      const ctx = {
        event: {
          body: 'not json'
        }
      }
      try {
        await kJsonBody(ctx, noop)
        throw 'Should not happen'
      } catch(e) {
        expect(e).to.have.property('code').which.equal(0)
      }
    })
    it('should raise if body is missing', async () => {
      const ctx = {
        event: {}
      }
      try {
        await kJsonBody(ctx, noop)
        throw 'Should not happen'
      } catch(e) {
        expect(e).to.have.property('code').which.equal(0)
      }
    })
  })
  describe('kMapProperty middleware', () => {
    it('should return a middleware', () => {
      expect(kMapProperty('A', 'B')).to.be.a('Function')
    })
    it('should map property A to property B', async () => {
      const ctx = {
        event: {
          A: 'abc'
        }
      }
      await kMapProperty('A', 'B')(ctx, noop)
      expect(ctx.event).to.have.property('B').which.equal('abc')
    })
    it('should set value to default if provided and no property is found', async () => {
      const ctx = {
        event: {
          D: 'abc'
        }
      }
      await kMapProperty('A', 'B', 42)(ctx, noop)
      expect(ctx.event).to.have.property('B').which.equal(42)
    })
    it('should set to null if no default and no property', async () => {
      const ctx = {
        event: {
          D: 'ggdfgfd'
        }
      }
      await kMapProperty('A', 'B')(ctx, noop)
      expect(ctx.event).to.have.property('B').which.is.null
    })
  })
})

describe('Given an instance of my Cat library', () => {
  before(() => {
    lib = new Cat();
  });
  describe('when I need the name', () => {
    it('should return the name', () => {
      expect(lib.name).to.be.equal('Cat');
    });
  });
});

describe('Given an instance of my Dog library', () => {
  before(() => {
    lib = new Dog();
  });
  describe('when I need the name', () => {
    it('should return the name', () => {
      expect(lib.name).to.be.equal('Dog');
    });
  });
});
