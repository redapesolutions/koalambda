import get from 'lodash/get'
import has from 'lodash/has'

export const when = (check: (ctx) => Promise<Boolean> | Boolean, middleware: (ctx, next) => Promise<any>) => {
  return async (ctx, next) => {
    const proceed = await check(ctx)
    if(proceed) {
      middleware(ctx, next)
    } else {
      next()
    }
  }
}

export const whenAttributeExists = (attr: string, middleware: (ctx, next) => Promise<any>) => when(ctx => has(ctx, attr), middleware)
export const whenAttributeEquals = (attr: string, compare: any, middleware: (ctx, next) => Promise<any>) => when(ctx => get(ctx, attr) === compare, middleware)