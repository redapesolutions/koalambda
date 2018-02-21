import {
  kompose,
  jsonBody,
  callbackBased,
  standardHttpResponse,
  HTTP_ERROR_CODES,
  ForbiddenError,
  UnauthorizedError,
  redirectHttpResponse,
  _makeResponse,
  _makeBadRequest,
  _makeUnauthorized,
  _makeForbidden,
  _makeRedirect,
  _callbackBasedHttpHandleError,
  makeResponse,
  _makeError,
  makeSuccess,
  httpResponse
} from '../lib'
import { expect } from 'chai'
import noop from 'lodash/noop'
import { spy } from 'sinon'




describe('http', () => {
  describe('internal functions', () => {
    describe('_makeResponse', () => {
      it('Should make response without cors', async () => {
        let result = _makeResponse(
          {
            test: 1
          },
          200,
          false,
        )

        expect(result).to.have.property('statusCode').which.equals(200)
        expect(result).to.have.property('headers').which.has.property('Content-Type').which.equals('application/json')
        expect(result).to.have.property('body').which.equals('{"test":1}')
      })
      it('Should make response with cors and should add header', async () => {
        let result = _makeResponse(
          {
            test: 1
          },
          400,
          true,
          {
            Location: 'www.wp.pl'
          }
        )

        expect(result).to.have.property('statusCode').which.equals(400)
        expect(result).to.have.property('headers')
        expect(result.headers).to.have.property('Content-Type').which.equals('application/json')
        expect(result.headers).to.have.property('Access-Control-Allow-Origin').which.equals('*')
        expect(result.headers).to.have.property('Location').which.equals('www.wp.pl')
        expect(result).to.have.property('body').which.equals('{"test":1}')
      })
    })
    describe('_makeBadRequest', () => {
      it('Should make BadRequest response', async () => {
        let result = _makeBadRequest('Test')

        expect(result).to.have.property('statusCode').which.equals(400)
        expect(result).to.have.property('body').which.equals('{"message":"Test","code":0}')
      })
    })
    describe('_makeUnauthorized', () => {
      it('Should make Unauthorized response', async () => {
        let result = _makeUnauthorized('Test')

        expect(result).to.have.property('statusCode').which.equals(401)
        expect(result).to.have.property('body').which.equals('{"message":"Test","code":0}')
      })
    })
    describe('_makeForbidden', () => {
      it('Should make Forbidden response', async () => {
        let result = _makeForbidden('Test')

        expect(result).to.have.property('statusCode').which.equals(403)
        expect(result).to.have.property('body').which.equals('{"message":"Test","code":0}')
      })
    })
    describe('_makeRedirect', () => {
      it('Should make Redirect response', async () => {
        let result = _makeRedirect('www.wp.pl')

        expect(result).to.have.property('statusCode').which.equals(303)
        expect(result).to.have.property('headers').which.has.property('Location').which.equals('www.wp.pl')
      })
    })
    describe('_makeError', () => {
      it('Should make default error', async () => {
        let result = _makeError ('test')
  
        expect(result).to.have.property('statusCode').which.equals(400)
        expect(result.headers).to.have.property('Content-Type').which.equals('application/json')
        expect(result.headers).to.have.property('Access-Control-Allow-Origin').which.equals('*')
        expect(result).to.have.property('body').which.equals('{"message":"test","code":0}')
      })
      it('Should make specified error', async () => {
        let result = _makeError ('test', 500, true, 12)
  
        expect(result).to.have.property('statusCode').which.equals(500)
        expect(result.headers).to.have.property('Content-Type').which.equals('application/json')
        expect(result.headers).to.have.property('Access-Control-Allow-Origin').which.equals('*')
        expect(result).to.have.property('body').which.equals('{"message":"test","code":12}')
  
      })
    })
    describe('_callbackBasedHttpHandleError', () => {
      it('should return forbidden response', async () => {
        let result = await _callbackBasedHttpHandleError(new ForbiddenError())

        expect(result).to.have.property('statusCode').which.equals(403)
      })
      it('should return unauthorized response', async () => {
        let result = await _callbackBasedHttpHandleError(new UnauthorizedError())

        expect(result).to.have.property('statusCode').which.equals(401)
      })
      it('should return code 0 when is array and tha code number', async () => {
        let result = await _callbackBasedHttpHandleError(['message', 500])

        expect(result).to.have.property('statusCode').which.equals(500)
        expect(result).to.have.property('body').which.equals('{"message":"message","code":0}')
      })
      it('should return code 12 when is object and 400 code number', async () => {
        let result = await _callbackBasedHttpHandleError({message: 'ok', code: 12})

        expect(result).to.have.property('statusCode').which.equals(400)
        expect(result).to.have.property('body').which.equals('{"message":"ok","code":12}')
      })
      it('should return code 0 when is object and 400 code number if code in not a number', async () => {
        let result = await _callbackBasedHttpHandleError({message: 'ok', code: "NotNumber"})

        expect(result).to.have.property('statusCode').which.equals(400)
        expect(result).to.have.property('body').which.equals('{"message":"ok","code":0}')
      })

      it('should return code 0 when is object and 400 code number if code is not defined', async () => {
        let result = await _callbackBasedHttpHandleError(['ok', 'NotANumber'])

        expect(result).to.have.property('statusCode').which.equals(400)
        expect(result).to.have.property('body').which.equals('{"message":"ok","code":0}')
      })

      it('should return code 0 when is object and 400 if empty objecct is thrown', async () => {
        let result = await _callbackBasedHttpHandleError({})

        expect(result).to.have.property('statusCode').which.equals(400)
        expect(result).to.have.property('body').which.equals('{"message":{},"code":0}')
      })
    })    
  })
  
  describe('httpResponse middleware', () => {
    it('Should make response in state', async () => {
      let ctx = {
        state: {
        }
      }

      await httpResponse(303, 403, true, {Location: 'ok'})(ctx, () => {
        expect(ctx.state).to.not.have.property('response')

        ctx.state.response = {
          test: 1
        }
      })

      expect(ctx.state.response).to.have.property('statusCode').which.equals(303)
      expect(ctx.state.response.headers).to.have.property('Content-Type').which.equals('application/json')
      expect(ctx.state.response.headers).to.have.property('Access-Control-Allow-Origin').which.equals('*')
      expect(ctx.state.response).to.have.property('body').which.equals('{"test":1}')

    })
    it('Should make error response in state', async () => {
      let ctx = {
        state: {
        }
      }

      await httpResponse(303, 400, true, {Location: 'ok'})(ctx, () => {
        expect(ctx.state).to.not.have.property('response')

        throw new ForbiddenError()
      })

      expect(ctx.state.response).to.have.property('statusCode').which.equals(403)
      expect(ctx.state.response.headers).to.have.property('Content-Type').which.equals('application/json')
      expect(ctx.state.response.headers).to.have.property('Access-Control-Allow-Origin').which.equals('*')
    })
  })

  describe('makeSuccess middleware', () => {
    it('Should make response in state', async () => {
      let ctx = {
        state: {
        }
      }

      await makeSuccess(ctx, () => {
        expect(ctx.state).to.not.have.property('response')

        ctx.state.response = {
          test: 1
        }
      })

      expect(ctx.state.response).to.have.property('statusCode').which.equals(200)
      expect(ctx.state.response.headers).to.have.property('Content-Type').which.equals('application/json')
      expect(ctx.state.response.headers).to.have.property('Access-Control-Allow-Origin').which.equals('*')
      expect(ctx.state.response).to.have.property('body').which.equals('{"test":1}')

    })
    it('Should make response in state even if body not defined', async () => {
      let ctx = {
        state: {
        }
      }

      await makeSuccess(ctx, () => {
        expect(ctx.state).to.not.have.property('response')
      })

      expect(ctx.state.response).to.have.property('statusCode').which.equals(200)
      expect(ctx.state.response.headers).to.have.property('Content-Type').which.equals('application/json')
      expect(ctx.state.response.headers).to.have.property('Access-Control-Allow-Origin').which.equals('*')
    })
  })

  describe('makeResponse middleware', () => {
    it('Should make response in state', async () => {
      let ctx = {
        state: {}
      }

      await makeResponse (501, true, { Location: 'www.wp.pl'}) (ctx, () => {
        expect(ctx.state).to.not.have.property('response')

        ctx.state.response = {
          test: 1
        }
      })

      expect(ctx.state.response).to.have.property('statusCode').which.equals(501)
      expect(ctx.state.response.headers).to.have.property('Content-Type').which.equals('application/json')
      expect(ctx.state.response.headers).to.have.property('Access-Control-Allow-Origin').which.equals('*')
      expect(ctx.state.response.headers).to.have.property('Location').which.equals('www.wp.pl')
      expect(ctx.state.response).to.have.property('body').which.equals('{"test":1}')

    })
    it('Should make response in state even in ctx.state.response is not defined - with cors', async () => {
      let ctx = {
        state: {}
      }

      await makeResponse (501, true, { Location: 'www.wp.pl'}) (ctx, () => {
        expect(ctx.state).to.not.have.property('response')

      })

      expect(ctx.state.response).to.have.property('statusCode').which.equals(501)
      expect(ctx.state.response.headers).to.have.property('Content-Type').which.equals('application/json')
      expect(ctx.state.response.headers).to.have.property('Access-Control-Allow-Origin').which.equals('*')
      expect(ctx.state.response.headers).to.have.property('Location').which.equals('www.wp.pl')

    })
    it('Should make response in state even in ctx.state.response is not defined - no cors', async () => {
      let ctx = {
        state: {}
      }

      await makeResponse (501, false, { Location: 'www.wp.pl'}) (ctx, () => {
        expect(ctx.state).to.not.have.property('response')

      })

      expect(ctx.state.response).to.have.property('statusCode').which.equals(501)
      expect(ctx.state.response.headers).to.have.property('Content-Type').which.equals('application/json')
      expect(ctx.state.response.headers).to.not.have.property('Access-Control-Allow-Origin')
      expect(ctx.state.response.headers).to.have.property('Location').which.equals('www.wp.pl')

    })
  })

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

      expect(result.statusCode).to.equal(401)
    })
  })
  describe('redirectHttpResponse', () => {
    it('Should return redirection', async() => {
      let ctx = {
        state: {
          testVar: 'link'
        }
      }
      await redirectHttpResponse('testVar')(ctx, () => null)

      expect(ctx.state.response).to.have.property('statusCode').which.is.equal(303)
      expect(ctx.state.response).to.have.property('headers').which.has.property('Location').which.equals('link')
    })
    it('Should return error', async() => {
      let ctx = {
        state: {
          testVar: 'link'
        }
      }

      await redirectHttpResponse('testVar')(ctx, () => {
        throw new Error('Shit happend')
      })

      expect(ctx.state.response).to.have.property('statusCode').which.is.equal(400)
    })

    it('Should return forbiddenError', async() => {
      let ctx = {
        state: {
          testVar: 'link'
        }
      }
      
      await redirectHttpResponse('testVar')(ctx, () => {
        throw new ForbiddenError()
      })

      expect(ctx.state.response).to.have.property('statusCode').which.is.equal(403)
    })

    it('Should return unauthorizedError', async() => {
      let ctx = {
        state: {
          testVar: 'link'
        }
      }
      
      await redirectHttpResponse('testVar')(ctx, () => {
        throw new UnauthorizedError()
      })

      expect(ctx.state.response).to.have.property('statusCode').which.is.equal(401)
    })
  })
})