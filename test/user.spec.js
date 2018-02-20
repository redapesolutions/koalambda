import { withUserId, withOptionalUserId, kompose } from '../lib'
import { expect } from 'chai'

describe('User', () => {
  describe('User id middleware', () => {
    it('should reject if user id is not found', async () => {
      let ctx = {
        event: {},
        context: {},
        state: {}
      }
      try{
        await withUserId(ctx, () => null)
        return Promise.reject(new Error('Should throw')) 
      } catch (err) {
        expect(err.code).to.equal(403)
      }
    })
    it('should set the user id on state when found', async () => {
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

      await withUserId(ctx, () => null)

      expect(ctx.state.userId).to.equal(42)
    })
    it('it should take cognito user', async () => {
      const ctx = {
        context: {},
        event: {
          requestContext: {
            authorizer: {
              claims: {
                sub: 42
              }
            }
          }
        },
        state: {}
      }
      await withUserId(ctx, () => null)

      expect(ctx.state.userId).to.equal(42)
    })
    it('it should take Cognito Post confirmation', async () => {
      const ctx = {
        context: {},
        event: {
          request: {
            userAttributes: {
              sub: 42
            }
          }
        },
        state: {}
      }
      await withUserId(ctx, () => null)

      expect(ctx.state.userId).to.equal(42)
    })
    it('should be komposable', async () => {
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

      await handler(event, context)

      expect(context.a).to.equal(50)
      expect(context.b).to.equal(40)
    })
  })
  describe('Optional user id middleware', () => {
    it('should not reject if user id is not found', async () => {
      let ctx = {
        event: {},
        context: {},
        state: {}
      }

      await withOptionalUserId(ctx, () => {})

      expect(ctx.userId).to.be.undefined

    })
    it('should set the user id on state when found', async () => {
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

      await withOptionalUserId(ctx, () => null)

      expect(ctx.state.userId).to.equal(42)
    })
    it('it should take cognito user', async () => {
      const ctx = {
        context: {},
        event: {
          requestContext: {
            authorizer: {
              claims: {
                sub: 42
              }
            }
          }
        },
        state: {}
      }
      await withOptionalUserId(ctx, () => null)

      expect(ctx.state.userId).to.equal(42)
    })
    it('it should take Cognito Post confirmation', async () => {
      const ctx = {
        context: {},
        event: {
          request: {
            userAttributes: {
              sub: 42
            }
          }
        },
        state: {}
      }
      await withOptionalUserId(ctx, () => null)

      expect(ctx.state.userId).to.equal(42)
    })
    it('should be komposable', async () => {
      const context = {},
        event = {
          requestContext: {
            identity: {
              user: 42
            }
          }
        }

      const handler = kompose(
        withOptionalUserId,
        async (ctx, next) => {
          ctx.context.a = 50
          await next()
          ctx.context.b = 40
        }
      )

      await handler(event, context)

      expect(context.a).to.equal(50)
      expect(context.b).to.equal(40)
    })  
  })
  
})