
export const doNotWaitForBgProcessesToFinish = async (ctx, next) => {
  ctx.context.callbackWaitsForEmptyEventLoop = false
  await next()
}

export const anyBased = async (next, cb, ctx) => {
  try {
    await next()
    cb(null, ctx.state.response)
  } catch (e) {
    cb(e)
  }
}

export const contextBased = async (ctx, next) => {
  await anyBased(next, ctx.context.done, ctx)
}

export const callbackBased = async (ctx, next) => {
  await anyBased(next, ctx.callback, ctx)
}