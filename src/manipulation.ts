import get from 'lodash/get'

export const mapPropertyDown = (source: string, target: string, defaultValue?: any) => async (ctx, next?) => {
  ctx.state[target] = get(ctx.state, source, defaultValue || null)
  next && await next()
}

export const mapPropertyUp = (source: string, target: string, defaultValue?: any) => async (ctx, next?) => {
  next && await next()
  ctx.state[target] = get(ctx.state, source, defaultValue || null)
}