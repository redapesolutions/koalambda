import {
  kompose,
  jsonBody,
  callbackBased,
  standardHttpResponse,
  HTTP_ERROR_CODES,
  ForbiddenError,
  UnauthorizedError
} from '../lib'
import { expect } from 'chai'
import noop from 'lodash/noop'
import { spy } from 'sinon'

describe('http', () => {

  describe('jsonBody middleware', () => {
    it('should parse the json body and put it onto event s body', async () => {
      const ctx = {
        event: {
          body: JSON.stringify({ a: 42 })
        },
        state: {}
      }
      await jsonBody(ctx, noop)
      expect(ctx.state.body).to.be.an('Object').which.has.property('a')
    })
    it('should raise if body is not valid JSON', async () => {
      const ctx = {
        event: {
          body: 'not json'
        }
      }
      try {
        await jsonBody(ctx, noop)
        throw 'Should not happen'
      } catch (e) {
        expect(e).to.have.property('code').which.equal(HTTP_ERROR_CODES.JSON_PARSING_ERROR)
      }
    })
    it('should raise if body is missing', async () => {
      const ctx = {
        event: {}
      }
      try {
        await jsonBody(ctx, noop)
        throw 'Should not happen'
      } catch (e) {
        expect(e).to.have.property('code').which.equal(HTTP_ERROR_CODES.MISSING_BODY)
      }
    })
  })

  describe('Http response middleware', () => {
    it('should handle a http success correctly', () => {
      const cb = spy()
      const event = {}
      const context = {}
      const whatToReply = 'Hi there'
      return kompose(
        callbackBased,
        standardHttpResponse,
        async (ctx, next) => {
          ctx.state.response = whatToReply
          await next()
        }
      )(event, context, cb)
        .then(_ => {
          const [err, response] = cb.firstCall.args
          expect(err).to.be.null
          expect(response.statusCode).to.equal(200) // Status
          expect(response.headers['Access-Control-Allow-Origin']).to.equal('*') // CORS
          expect(JSON.parse(response.body)).to.equal(whatToReply) // JSON encoded body
        })
    })
    it('should handle a planned error correctly', async () => {
      const event = {}
      const context = {}
      const exception = { code: 42, message: 'Nope' }

      let preparedKompose = kompose(
        callbackBased,
        standardHttpResponse,
        async (ctx, next) => {
          throw exception
        }
      )

      let result = await new Promise((resolve, reject) => {
        preparedKompose(event, context, (err, data) => {
          if(err)
            reject(err)
          else
            resolve(data)
        })         
      });

      console.log(result)
      expect(result.statusCode).to.equal(400)
      expect(JSON.parse(result.body)).to.eql(exception)      
    })
    it('should return forbidden', async () => {
      const event = {}
      const context = {}
      const exception = new ForbiddenError()
      let preparedKompose = kompose(
        callbackBased,
        standardHttpResponse,
        async (ctx, next) => {
          throw exception
        }
      )

      let result = await new Promise((resolve, reject) => {
        preparedKompose(event, context, (err, data) => {
          if(err)
            reject(err)
          else
            resolve(data)
        })         
      });

      console.log(result)
      expect(result.statusCode).to.equal(403)
    })
    it('should return unauthorized', async () => {
      const cb = spy()
      const event = {}
      const context = {}
      const exception = new UnauthorizedError()
      let preparedKompose = kompose(
        callbackBased,
        standardHttpResponse,
        async (ctx, next) => {
          throw exception
        }
      )

      let result = await new Promise((resolve, reject) => {
        preparedKompose(event, context, (err, data) => {
          if(err)
            reject(err)
          else
            resolve(data)
        })         
      });

      console.log(result)
      expect(result.statusCode).to.equal(401)
    })
  })
})