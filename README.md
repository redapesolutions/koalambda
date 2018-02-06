# Koala-mbda or Koa-Lambda

Koa-style middleware concept to quickly build AWS Lambda functions

Middlewares
===========

Use Koa style middlewares and the `kompose` method. Examples can be found in handlers e.g. `user/addToHistory.ts`  
A handler is therefore simply equal to the outcome of `kompose` e.g.

```
export const handler = kompose(
    callbackBased,
    ...,
    async (ctx, next) => {
        ... // <- this is called while going down the middleware chain
        await next()
        ... // <- this is called once the bottom of the chain has been reached and we are going back up the chain
    },
    ...
)
```

## Rules

A middleware follows the following rules:

- arguments are `ctx:EventContext` and `next` (optional, see Utility middlewares below)
- `ctx` contains three properties: `event:AWSEvent`, `context:AWSContext` and `state`. The event type varies depending on the trigger of the lambda function.
- All middlewares should be `async` functions; they should always call `await next()` (or `next && await next()` in the case of utility)
- Code reached _before_ the `await next()` call is processed _down_ the middleware chain
- Code reached _after_ the `await next()` call is processed _up_ the middleware chain
- In case of errors, the middleware should `throw` an error, not return a rejected promise

## Convention

- All properties to be added or modified along the middleware chain should be added/modified on the `ctx.state` object
- For HTTP based calls, the top chain will expect a `ctx.state.response` property to be populated
- Errors thrown follow the pattern: `{message: '...', code: 42}`

## Utility middlewares

In case of utility middlewares, that are expected to be used both as normal functions and as part of a middleware chain:

- the `next` parameter should be made optional (`next?`)
- the call to `next` should be made optional with the statement `next && await next()`

E.g. `withUserId` can be used as a part of a chain, when user isn't needed (only id) but it is also used within `withUser` as normal function

## Base middlewares

↓ means acts _down_ the chain; ↑ _up_ the chain

### callbackBased & contextBased ↑

Decide how the outcome of the Lambda function is triggered. Http calls use callback, whereas Cognito triggers use context for example. As of this writing, one of the two **must** be used as the top middleware for any *handler* function

### httpResponse & standardHttpResponse ↑

Handles Http responses, both success and error. `standardHttpResponse` simply uses a default code 200 for success, as well as default CORS enabled and JSON content.

### withUserId ↓

Reads the user Id from the request and adds it as `ctx.state.userId`

### withUser ↓

Reads the user Id and loads the corresponding user object. Adds the user as `ctx.state.user`  
*Note:* Does not require `withUserId` to be added to the chain as it is already part of the code of withUser. 

### jsonBody ↓

JSON-Parses the body of a POST. Sets the parsed object back onto `ctx.state.body` (overwrites original)

### putInState ↓

Takes value with specified name and puts it in the state 

### filter ↓

filter the specified argument by specified function 

## Changelog

### v0.0.2:

- move all properties to state
- move `koa-compose` initialisation higher to avoid checking functions twice (thank you @yujilim)
