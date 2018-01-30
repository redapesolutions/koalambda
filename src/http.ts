import get from 'lodash/get'
import isArray from 'lodash/isArray'
import isNumber from 'lodash/isNumber'

export enum ERROR_CODES {
  JSON_PARSING_ERROR=100,
  MISSING_BODY
}

export const jsonBody = async (ctx, next?) => {
  let body = ctx.event.body
  if (body === null || body === undefined) {
    throw {message: `Empty body`, code: ERROR_CODES.MISSING_BODY}
  }
  try {
      body = JSON.parse(ctx.event.body)
  } catch (ex) {
      throw {message: `Failed to parse body: ${ex}`, code: ERROR_CODES.JSON_PARSING_ERROR}
  }
  ctx.state.body = body
  next && await next()
}

export const _makeResponse = (body: {[prop:string]: any}, statusCode = 200, cors = true, headers: {[prop:string]: any} = {}) => {
  const resp = {
    statusCode,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }
  if (cors) {
    resp.headers = Object.assign(resp.headers, {
      "Access-Control-Allow-Origin": "*",
      ...headers
    })
  }
  return resp
}

export const _callbackBasedHttpHandleError = err => {
  let message: string, code: number = 400, internalCode: number = 0

  if (isArray(err)) {
    [message, code] = err
  } else {
    [message, internalCode] = [
      get(err, 'message', err),
      get(err, 'code')
    ]
  }

  if (!code || !isNumber(code)) {
    code = 0
    message = 'System error'
  }

  return makeError(message, code, true, internalCode)
}

export const makeResponse = (statusCode = 200, cors = true, headers: {[prop:string]: any} = {}) => async (ctx, next) => {
  await next()
  ctx.state.response = _makeResponse(ctx.state.response, statusCode, cors, headers)
}


export const makeError = (message: string, statusCode = 400, cors = true, internalErrorCode = 0) => {
  return _makeResponse({
    message,
    code: internalErrorCode
  }, statusCode, cors)
}

export const makeSuccess = makeResponse()

export const httpResponse = (successCode = 200, errorCode = 400, cors = true, headers: {[prop:string]: any} = {}) => async (ctx, next) => {
  try {
    await next()
    ctx.state.response = _makeResponse(ctx.state.response, ctx.state.response.statusCode || successCode, cors, headers)
  } catch (e) {
    ctx.state.response = _callbackBasedHttpHandleError(e)
  }
}

export const standardHttpResponse = httpResponse()
