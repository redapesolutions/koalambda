import * as get from 'lodash/get';

export const withPathValue = (paramName: string, defaultValue?: any, isOptional = false) => {
    return async (ctx, next?) => {
        let paramValue
        if(ctx.event.pathParameters)
            paramValue = ctx.event.pathParameters[paramName]
        
        if(paramValue === undefined)
            paramValue = defaultValue

        if(paramValue === undefined && !isOptional)
            throw new Error(`Value of parameter ${paramName} is unknown`)

        ctx.state[paramName] = paramValue

        next && await next()
    }
}

export const withQuerystringValue = (paramName: string, defaultValue?: any, isOptional = false) => {
    return async (ctx, next?) => {
        let paramValue
        if(ctx.event.queryStringParameters)
            paramValue = ctx.event.queryStringParameters[paramName]
        
        if(paramValue === undefined)
            paramValue = defaultValue

        if(paramValue === undefined && !isOptional)
            throw new Error(`Value of parameter ${paramName} is unknown`)

        ctx.state[paramName] = paramValue

        next && await next()
    }
}