import {AsyncFunction, EventContext} from './interfaces'
import koaCompose from 'koa-compose'

export const kompose = (...fns: AsyncFunction[]) => {
  fns.forEach(fn => {
    if (typeof fn !== 'function') throw new TypeError('middleware must be a function!');
  })
  return (event, context, callback?) => koaCompose(fns)({event, context, callback, state: {}} as EventContext)
}