import each from 'lodash/each'
import get from 'lodash/get'

const _getUserIdFromEvent = event => {
    // Could be in various places    
    let userId
    each([
        'requestContext.identity.user',
        'requestContext.authorizer.claims.sub', // Cognito auth
        'request.userAttributes.sub', // Cognito Post confirmation
    ], key => {
        userId = get(event, key)
        if (userId) {
            // Equivalent of a break
            return false
        }
    })
    return userId
}

const _withUserId = (isOptional = false) => async (ctx, next?) => {
    const userId = _getUserIdFromEvent(ctx.event)

    if (!isOptional && !userId) {
        throw { message: 'User id is missing', code: 403 }
    }

    ctx.state.userId = userId
    next && await next()
}

export const withUserId = _withUserId()
export const withOptionalUserId = _withUserId(true)