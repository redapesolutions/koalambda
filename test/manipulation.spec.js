import {
  kompose,
  mapPropertyDown,
  mapPropertyUp,
  putEventToState,
  filterProperty,
  putEnvVariableToState,
  executeInOrder,
  paginateResponse
} from '../lib'
import {
  expect
} from 'chai'
import noop from 'lodash/noop'
import * as process from 'process'
import set from 'lodash/set'
import isArray from 'lodash/isArray'

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
      } catch (ex) {
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
        state: {
          test: 0
        }
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
    it('should throw if stop condition is not a function', async () => {
      let context = {
        state: {
          test: 0
        }
      }
      try {
        await executeInOrder(
          'Not a function',

          async (ctx) => {
            ctx.state.test = 1
          },
          async (ctx) => {
            ctx.state.test = 2
          },
          async (ctx) => {
            ctx.state.test = 3
          }
        )(context, () => {})
        return Promise.reject('Should throw')
      } catch (ex) {
        expect(ex).be.instanceof(Error)
      }
    })
  })
  describe('paginateResponse', () => {
    it('Should throw if offset is not defined in state', async () => {
      let ctx = {
        state: {
          count: 1,
          apiPaginationEndpoint: 'www.wp.pl',
          response: {
            items: [1],
            totalCount: 1
          }
        },

      }
      try {
        await paginateResponse(ctx, () => {})
        return Promise.reject('Should throw')
      } catch (ex) {
        expect(ex).be.instanceOf(Error)
      }
    })
    it('Should throw if offset < 0', async () => {
      let ctx = {
        state: {
          offset: -1,
          apiPaginationEndpoint: 'www.wp.pl',
          count: 1,
          response: {
            items: [1],
            totalCount: 1
          }
        },

      }
      try {
        await paginateResponse(ctx, () => {})
        return Promise.reject('Should throw')
      } catch (ex) {
        expect(ex).be.instanceOf(Error)
      }
    })
    it('Should throw if count is not defined in state', async () => {
      let ctx = {
        state: {
          apiPaginationEndpoint: 'www.wp.pl',
          offset: 1,
          response: {
            items: [1],
            totalCount: 1
          }
        },

      }
      try {
        await paginateResponse(ctx, () => {})
        return Promise.reject('Should throw')
      } catch (ex) {
        expect(ex).be.instanceOf(Error)
      }
    })
    it('Should throw if count < 0', async () => {
      let ctx = {
        state: {
          offset: 2,
          apiPaginationEndpoint: 'www.wp.pl',
          count: -1,
          response: {
            items: [1],
            totalCount: 1
          }
        },

      }
      try {
        await paginateResponse(ctx, () => {})
        return Promise.reject('Should throw')
      } catch (ex) {
        expect(ex).be.instanceOf(Error)
      }
    })
    it('Should throw if count == 0', async () => {
      let ctx = {
        state: {
          offset: 2,
          apiPaginationEndpoint: 'www.wp.pl',
          count: 0,
          response: {
            items: [1],
            totalCount: 1
          }
        },

      }
      try {
        await paginateResponse(ctx, () => {})
        return Promise.reject('Should throw')
      } catch (ex) {
        expect(ex).be.instanceOf(Error)
      }
    })
    it('Should throw if apiPaginationEndpoint is missing', async () => {
      let ctx = {
        state: {
          offset: 2,
          count: 0,
          response: {
            items: [1],
            totalCount: 1
          }
        },

      }
      try {
        await paginateResponse(ctx, () => {})
        return Promise.reject('Should throw')
      } catch (ex) {
        expect(ex).be.instanceOf(Error)
      }
    })
    it('Should throw if response is not defined in state', async () => {
      let ctx = {
        state: {
          apiPaginationEndpoint: 'www.wp.pl',
          count: 1,
          offset: 1,
        },
      }
      try {
        await paginateResponse(ctx, () => {})
        return Promise.reject('Should throw')
      } catch (ex) {
        expect(ex).be.instanceOf(Error)
      }
    })
    it('Should throw if response.items is not defined in state', async () => {
      let ctx = {
        state: {
          apiPaginationEndpoint: 'www.wp.pl',
          count: 1,
          offset: 1,
          response: {
            totalCount: 1
          }
        },

      }
      try {
        await paginateResponse(ctx, () => {})
        return Promise.reject('Should throw')
      } catch (ex) {
        expect(ex).be.instanceOf(Error)
      }
    })
    it('Should throw if response.items is not array', async () => {
      let ctx = {
        state: {
          apiPaginationEndpoint: 'www.wp.pl',
          count: 1,
          offset: 1,
          response: {
            totalCount: 1,
            items: 1
          }
        },

      }
      try {
        await paginateResponse(ctx, () => {})
        return Promise.reject('Should throw')
      } catch (ex) {
        expect(ex).be.instanceOf(Error)
      }
    })
    it('Should throw if response.items is empty array', async () => {
      let ctx = {
        state: {
          apiPaginationEndpoint: 'www.wp.pl',
          count: 1,
          offset: 1,
          response: {
            totalCount: 1,
            items: []
          }
        },

      }
      try {
        await paginateResponse(ctx, () => {})
        return Promise.reject('Should throw')
      } catch (ex) {
        expect(ex).be.instanceOf(Error)
      }
    })
    it('Should throw if response.totalCount is not defined in state', async () => {
      let ctx = {
        state: {
          count: 1,
          apiPaginationEndpoint: 'www.wp.pl',
          offset: 1,
          response: {
            items: [1],
          }
        },

      }
      try {
        await paginateResponse(ctx, () => {})
        return Promise.reject('Should throw')
      } catch (ex) {
        expect(ex).be.instanceOf(Error)
      }
    })
    it('Should throw if response.totalCount < 0', async () => {
      let ctx = {
        state: {
          count: 1,
          apiPaginationEndpoint: 'www.wp.pl',
          offset: 1,
          response: {
            items: [1],
            totalCount: -1
          }
        },

      }
      try {
        await paginateResponse(ctx, () => {})
        return Promise.reject('Should throw')
      } catch (ex) {
        expect(ex).be.instanceOf(Error)
      }
    })
    it('Should paginateResponse the response', async () => {
      let ctx = {
        state: {
          count: 5,
          apiPaginationEndpoint: 'www.wp.pl',
          offset: 10,
          response: {
            items: [1, 2, 3, 4, 5],
            totalCount: 51
          }
        },

      }

      try {
        await paginateResponse(ctx, () => {})
      } catch (ex) {
        throw new Error('Should not throw' + ex)
      }

      let response = ctx.state.response

      expect(response).to.have.property('items')
      expect(isArray(response.items)).to.be.true
      expect(response.items.length).to.be.equal(5)
      expect(response).to.have.property('_pagination')
      expect(response._pagination).to.have.property('totalCount').which.equals(51)
      expect(response._pagination).to.have.property('requestCount').which.equals(5)
      expect(response._pagination).to.have.property('requestOffset').which.equals(10)
      expect(response._pagination).to.have.property('requestPageNumber').which.equals(2)
      expect(response._pagination).to.have.property('requestPageNumberDisplay').which.equals('3')
      expect(response._pagination).to.have.property('totalPageCount').which.equals(11)
      expect(response._pagination).to.have.property('previousUrl').which.equals('www.wp.pl?offset=5&count=5')
      expect(response._pagination).to.have.property('nextUrl').which.equals('www.wp.pl?offset=15&count=5')
      expect(response._pagination).to.have.property('firstUrl').which.equals('www.wp.pl?offset=0&count=5')
      expect(response._pagination).to.have.property('lastUrl').which.equals('www.wp.pl?offset=50&count=5')
      expect(response._pagination).to.have.property('pages')
    })
  })
})
