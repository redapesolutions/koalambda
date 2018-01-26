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
  ctx.event.body = body
  next && await next()
}