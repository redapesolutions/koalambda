import cloneDeep from 'lodash/cloneDeep'

export const fixedResponseBody = (value: any, clone = true) => async (ctx, next) => {
  await next()
  ctx.event.response = clone ? cloneDeep(value) : value
}