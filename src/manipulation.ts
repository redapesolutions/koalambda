import get from 'lodash/get'
import set from 'lodash/set'
import isArray from 'lodash/isArray';

export const mapPropertyDown = (source: string, target: string, defaultValue?: any) => async (ctx, next?) => {
  ctx.state[target] = get(ctx.state, source, defaultValue || null)
  next && await next()
}

export const mapPropertyUp = (source: string, target: string, defaultValue?: any) => async (ctx, next?) => {
  next && await next()
  ctx.state[target] = get(ctx.state, source, defaultValue || null)
}

export const putInState = async (variableName: string) => {
  return async (ctx, next?) => {
      let value = get(ctx.event, `${variableName}`)

      set(ctx.state, `${variableName}`, value)

      next && await next()
  }
}

export const filter = async (variableName: string, compareFunction: (record) => boolean) => {
  return async (ctx, next?) => {
      let array: any[] = get(ctx.state, `${variableName}`)

      if(!isArray(array))
          throw Error('Variable should be an array')

      set(ctx.state, `${variableName}`, array.filter(compareFunction))

      next && await next()
  }
}