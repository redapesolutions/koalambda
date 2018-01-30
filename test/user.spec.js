import { withUserId, kompose } from '../lib'
import {expect} from 'chai'

describe('User id middleware', () => {
  it('should reject if user id is not found', () => {
    return withUserId({
      context: {},
      event: {},
      state: {}
    }, () => null).catch(err => expect(err.code).to.equal(403) && null)
  })
  it('should set the user id on state when found', () => {
    const ctx = {
      context: {},
      event: {
        requestContext: {
          identity: {
            user: 42
          }
        }
      },
      state: {}
    }
    return withUserId(ctx, () => null).then(_ => expect(ctx.state.userId).to.equal(42) && null)
  })
  it('should be komposable', () => {
    const context = {},
    event = {
      requestContext: {
        identity: {
          user: 42
        }
      }
    }
    const handler = kompose(
      withUserId,
      async (ctx, next) => {
        ctx.context.a = 50
        await next()
        ctx.context.b = 40
      }
    )
    return handler(event, context).then(
      _ => expect(context.a).to.equal(50) && expect(context.b).to.equal(40) && null
    )
  })
})