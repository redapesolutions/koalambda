import {AsyncFunction, EventContext} from './interfaces'
import koaCompose from 'koa-compose'

export const kompose = (...fns: AsyncFunction[]) => {
  const composer = koaCompose(fns)
  return (event, context, callback?) => composer({event, context, callback} as EventContext)
}
