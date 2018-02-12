import {
  kompose,
  mapPropertyDown,
  mapPropertyUp,
  putEventToState,
  filterProperty,
  putEnvVariableToState,
  executeInOrder
} from '../lib'
import { expect } from 'chai'
import noop from 'lodash/noop'
import * as process from 'process'
import set from 'lodash/set'
describe('Manipulation', () => {
  describe('mapProperty middlewares', () => {
    it('should return a middleware', () => {
      expect(mapPropertyDown('A', 'B')).to.be.a('Function')
      expect(mapPropertyUp('A', 'B')).to.be.a('Function')
    })
    it('should map property A to property B', async () => {
      let ctx = {
        state: {
          A: 'abc'
        }
      }
      await mapPropertyDown('A', 'B.C')(ctx, noop)
      expect(ctx.state.B).to.have.property('C').which.equals('abc')
      // reset
      ctx = {
        state: {
          A: 'abc'
        }
      }
      expect(ctx.state).to.not.have.property('B')
      await mapPropertyUp('A', 'B.C')(ctx, noop)
      expect(ctx.state.B).to.have.property('C').which.equals('abc')
    })
    it('should set value to default if provided and no property is found', async () => {
      const ctx = {
        state: {
          D: 'abc'
        }
      }
      await mapPropertyDown('A', 'B.C', 42)(ctx, noop)
      expect(ctx.state.B).to.have.property('C').which.equals(42)
    })
    it('should set to null if no default and no property', async () => {
      const ctx = {
        state: {
          D: 'ggdfgfd'
        }
      }
      await mapPropertyDown('A', 'B')(ctx, noop)
      expect(ctx.state).to.have.property('B').which.is.null
    })
    describe('mapPropertyDown middleware', () => {
      it('should act on the way down', async () => {
        const ctx = {
          state: {
            A: 42
          }
        }
        await kompose(
          mapPropertyDown('A', 'B'),
          async (ctx, next) => {
            expect(ctx.state).to.have.property('B')
            await next()
          }
        )(ctx, noop)
      })
    })
    describe('mapPropertyUp middleware', () => {
      it('should act on the way up', async () => {
        const ctx = {
          state: {
            A: 42
          }
        }
        await kompose(
          async (ctx, next) => {
            expect(ctx.state).to.not.have.property('B')
            await next()
            expect(ctx.state).to.have.property('B')
          },
          mapPropertyUp('A', 'B'),
          async (ctx, next) => {
            expect(ctx.state).to.not.have.property('B')
            await next()
            expect(ctx.state).to.not.have.property('B')
          }
        )(ctx, noop)
      })
    })
  })
  describe('putInState middleware', () => {
    it('should take the property from event and put in state', async () => {
      const ctx = {
        event: {
          A: 42
        },
        state: {}
      }

      await kompose(
        async (ctx, next) => {
          expect(ctx.state).to.not.have.property('A')
          await next()
          expect(ctx.state).to.have.property('A')
        },
        putEventToState('A'),
        async (ctx, next) => {
          expect(ctx.state).to.have.property('A')
          await next()
          expect(ctx.state).to.have.property('A')
        }
      )(ctx, noop)
    })
    it('should create objects and undefined at the end', async () => {
      const ctx = {
        event: {},
        state: {}
      }

      await kompose(
        async (ctx, next) => {
          expect(ctx.state).to.not.have.property('A')
          await next()
          expect(ctx.state).to.have.property('A')
          expect(ctx.state.A).to.have.property('B')
          expect(ctx.state.A.B.C).to.equal(undefined)
        },
        putEventToState('A.B.C'),
        async (ctx, next) => {
          expect(ctx.state).to.have.property('A')
          expect(ctx.state.A).to.have.property('B')
          expect(ctx.state.A.B.C).to.equal(undefined)
          await next()
          expect(ctx.state).to.have.property('A')
          expect(ctx.state.A).to.have.property('B')
          expect(ctx.state.A.B.C).to.equal(undefined)
        }
      )(ctx, noop)
    })
  })
  describe('filter middleware', () => {
    it('should filter the values', async () => {
      const event = {
        A: [1, 2, 3, 4, 5]
      }

      await kompose(
        putEventToState('A'),
        async (ctx, next) => {
          expect(ctx.state.A.length).to.be.equal(5)
          await next()
          expect(ctx.state.A.length).to.be.equal(3)
        },
        filterProperty('A', n => n <= 3),
        async (ctx, next) => {
          expect(ctx.state.A.length).to.be.equal(3)
          await next()
          expect(ctx.state.A.length).to.be.equal(3)
        }
      )(event, noop)
    })
    it('Should throw if not array', async () => {
      const event = {
        A: ""
      }

      try {
        await kompose(
          putEventToState('A'),
          filterProperty('A', n => n <= 3)
        )(event, noop)
      }
      catch (ex) {
        return Promise.resolve('OK')
      }

      return Promise.reject('Should throw')

    })
  })
  describe('putEnvVariableInState middleware', () => {
    it('should put to the same path', async () => {
      process.env.Test = '1'

      await kompose(
        async (ctx, next) => {
          expect(ctx.state).to.not.have.property('Test')
          await next()
          expect(ctx.state.Test).to.be.equal('1')
        },
        putEnvVariableToState('Test'),
        async (ctx, next) => {
          expect(ctx.state.Test).to.be.equal('1')
          await next()
          expect(ctx.state.Test).to.be.equal('1')
        }
      )({}, noop)
    })
    it('should put to the specified path', async () => {
      process.env.Test = '1'

      await kompose(
        async (ctx, next) => {
          expect(ctx.state).to.not.have.property('Test')
          await next()
          expect(ctx.state).to.not.have.property('Test')
          expect(ctx.state.i.like.pancakes).to.be.equal('1')
        },
        putEnvVariableToState('Test', 'i.like.pancakes'),
        async (ctx, next) => {
          expect(ctx.state).to.not.have.property('Test')
          expect(ctx.state.i.like.pancakes).to.be.equal('1')
          await next()
          expect(ctx.state).to.not.have.property('Test')
          expect(ctx.state.i.like.pancakes).to.be.equal('1')
        }
      )({}, noop)
    })
  })

  describe('exeuteInOrder', () => {
    it('should take second value', async () => {
      let context = {
        state: { test: 0 }
      }

      let preparedExecuteInOrder = await executeInOrder(
        (ctx) => ctx.state.test === 2,

        async (ctx) => {
          ctx.state.test = 1
        },
        async (ctx) => {
          ctx.state.test = 2
        },
        async (ctx) => {
          ctx.state.test = 3
        }
      )

      kompose(
        async (ctx, next) => {
          ctx.state = context.state
          await next()
        },
        async (ctx, next) => {
          expect(ctx.state.test).to.equal(0)

          await next()

          expect(ctx.state.test).to.equal(2)

        },
        preparedExecuteInOrder,
        async (ctx, next) => {
          expect(ctx.state.test).to.equal(2)

          await next()

          expect(ctx.state.test).to.equal(2)

        },
      )({}, {})
    })
  })
})