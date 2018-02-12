import * as process from 'process'
import get from 'lodash/get'
import set from 'lodash/set'
import isArray from 'lodash/isArray';
import isFunction from 'lodash/isFunction';

export const mapPropertyDown = (source: string, target: string, defaultValue?: any) => async (ctx, next?) => {
    let value = get(ctx.state, source, defaultValue || null)

    set(ctx.state, target, value)

    next && await next()
}

export const mapPropertyUp = (source: string, target: string, defaultValue?: any) => async (ctx, next?) => {
    next && await next()
    let value = get(ctx.state, source, defaultValue || null)

    set(ctx.state, target, value)
}

export const putEventToState = (variableName: string) => {
    return async (ctx, next?) => {
        let value = get(ctx.event, `${variableName}`)

        set(ctx.state, `${variableName}`, value)

        next && await next()
    }
}

export const filterProperty = (variableName: string, filterFunction: (record) => boolean) => {
    return async (ctx, next?) => {
        let array: any[] = get(ctx.state, `${variableName}`)

        if (!isArray(array))
            throw Error('Variable should be an array')

        set(ctx.state, `${variableName}`, array.filter(filterFunction))

        next && await next()
    }
}

export const putEnvVariableToState = (envVariableName: string, variableStatePath?: string) => {
    return async (ctx, next?) => {
        //This process env is empty i do not know why
        const envValue = process.env[envVariableName]

        let where = envVariableName

        if (variableStatePath)
            where = variableStatePath

        set(ctx.state, where, envValue)

        next && await next()
    }
}

export const executeInOrder = (stopCondition: (ctx) => boolean, ...functions) => {
    return async (ctx, next?) => {
        if (!isFunction(stopCondition))
            throw Error('stopCondition is not a function')


        for (let fun of functions) {
            await fun(ctx)

            if (await stopCondition(ctx)) {
                next && await next()
                return
            }
        }
    }
}