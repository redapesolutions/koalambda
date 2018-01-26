import {AsyncFunction, EventContext} from './interfaces'
import {compose} from 'koa-compose'

export const kompose = (...fns: AsyncFunction[]) => {
  return (event, context, callback?) => {
      fns.forEach(fn => {
          if (typeof fn !== 'function') throw new TypeError('middleware must be a function!');
      })
      return compose(fns)({event, context, callback} as EventContext)
  }
}