import {
  kompose,
  HTTP_ERROR_CODES
} from '../lib'
import { expect } from 'chai'

describe('kompose', () => {
  describe('kompose function', () => {
    it('returns a function', () => {
      expect(kompose((c) => Promise.resolve('x'))).to.be.a('Function')
    })
    it('combines lambda s event and context into a single argument', () => {
      const a = { msg: 'I am "a"' }, b = { msg: 'I am "b"' }
      const fn = kompose(
        (arg) => {
          expect(arg).to.have.property('context').which.equals(b)
          expect(arg).to.have.property('event').which.equals(a)
          expect(arg).to.have.property('state').which.eqls({})
          return Promise.resolve(0)
        }
      )
      return fn(a, b)
    })
    it('only accepts functions', () => {
      expect(() => kompose(42)).to.throw()
    }),
      describe('Expected behavior follows Koa', () => {
        it('follows the path of the functions', (done) => {
          kompose(
            async (ctx, next) => {
              expect(ctx.state).to.not.have.property('steps')
              ctx.state.steps = 1
              await next()
              expect(ctx.state.steps).to.equal(2)
              return 3
            },
            async (ctx, next) => {
              expect(ctx.state.steps).to.equal(1)
              ctx.state.steps = 2
              await next()
            }
          )({}, {}).then(x => {
            expect(x).to.equal(3)
            done()
          })
        })
      })
  })
})