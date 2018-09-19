import get from 'lodash/get'
import isArray from 'lodash/isArray'
import isNumber from 'lodash/isNumber'
import * as Ajv from 'ajv'

export enum HTTP_ERROR_CODES {
  JSON_PARSING_ERROR = 100,
  MISSING_BODY
}

export const jsonBody = async (ctx, next?) => {
  let body = ctx.event.body
  if (body === null || body === undefined) {
    throw { message: `Empty body`, code: HTTP_ERROR_CODES.MISSING_BODY }
  }
  try {
    body = JSON.parse(ctx.event.body)
  } catch (ex) {
    throw { message: `Failed to parse body: ${ex}`, code: HTTP_ERROR_CODES.JSON_PARSING_ERROR }
  }
  ctx.state.body = body
  next && await next()
}

export const validateBodyWithJsonSchema = (schema) => {
  const ajv = new Ajv()
  let validator = null
  try {
      validator = ajv.compile(schema)
  } catch (err) {
      console.log('ERROR when compiling the schema', err)
      throw err
  }

  return async (ctx, next?) => {
      if (ctx.state.body === null || ctx.state.body === undefined)
          throw { message: 'property body is missing in the state'}
  
      let isValid = validator(ctx.state.body)
      console.log('isValid', isValid)

      if(!isValid)
          throw {
              message: `There was some json validation errors: ${JSON.stringify(validator.errors)}`,
              code: 'VALIDATION_ERROR',
              errors: validator.errors
          }
  
      next && await next()
  }
}


export const _makeResponse = (body: { [prop: string]: any }, statusCode = 200, cors = true, headers: { [prop: string]: any } = {}) => {
  const resp = {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: JSON.stringify(body)
  }

  if (cors) {
    resp.headers = Object.assign(resp.headers, {
      "Access-Control-Allow-Origin": "*",
    })
  }
  return resp
}

export const _makeBadRequest = message => _makeError(message)
export const _makeUnauthorized = message => _makeError(message, 401)
export const _makeForbidden = message => _makeError(message, 403)
export const _makeRedirect = (redirectUrl: string) => {
  return _makeResponse(
    {},
    303,
    true,
    {
      Location: redirectUrl
    }
  )
}

export const _callbackBasedHttpHandleError = err => {
  let message = 'System error', code = 400, internalCode = 0

  if (err instanceof ForbiddenError)
    return Promise.resolve(_makeForbidden(err.message))

  if (err instanceof UnauthorizedError)
    return Promise.resolve(_makeUnauthorized(err.message))

  if (isArray(err)) {
    [message, code] = err
  } else {
    [message, internalCode] = [
      get(err, 'message', err),
      get(err, 'code')
    ]
  }

  if (!code || !isNumber(code)) {
    code = 400
  }

  if (!internalCode) {
    internalCode = 0
  }

  return Promise.resolve(
    _makeError(message, code, true, internalCode)
  )
}

export const makeResponse = (statusCode = 200, cors = true, headers: { [prop: string]: any } = {}) => async (ctx, next) => {
  await next()
  ctx.state.response = _makeResponse(ctx.state.response, statusCode, cors, headers)
}


export const _makeError = (message: string, statusCode = 400, cors = true, internalErrorCode = 0) => {
  return _makeResponse({
    message,
    code: internalErrorCode
  }, statusCode, cors)
}

export const makeSuccess = makeResponse()

export const httpResponse = (successCode = 200, errorCode = 400, cors = true, headers: { [prop: string]: any } = {}) => async (ctx, next) => {
  try {
    await next()
    ctx.state.response = _makeResponse(ctx.state.response, ctx.state.response.statusCode || successCode, cors, headers)
  } catch (e) {
    ctx.state.response = await _callbackBasedHttpHandleError(e)
  }
}

export const standardHttpResponse = httpResponse()

export const redirectHttpResponse = (linkLocation: string) => async (ctx, next) => {
  try {
    await next()

    let link = get(ctx.state, linkLocation)
    ctx.state.response = _makeResponse({}, 303, true, { Location: link })
  } catch (e) {
    ctx.state.response = await _callbackBasedHttpHandleError(e)
  }
}


export class ForbiddenError {
  constructor(public message) {
    Error.apply(this, arguments);
  }
}

export class UnauthorizedError {
  constructor(public message) {
    Error.apply(this, arguments);
  }
}