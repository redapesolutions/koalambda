import * as process from 'process'
import get from 'lodash/get'
import set from 'lodash/set'
import isArray from 'lodash/isArray';
import isFunction from 'lodash/isFunction';
import * as apiPagination from 'api-pagination'
import isNumber from 'lodash/isNumber';
import * as isString from 'lodash/isString';


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

/** This function requiers to have two properties specified in the state:
 *  - 'offset' - number of skipped elemnets,
 *  - 'count' - number of elements per page
 *  - 'apiPaginationEndpoint' - the base url (ex. www.a.eu) for pages, result will look like http://www.a.eu/test?offest=1&count=2
 * 
 * It also requires response to have properties:
 *  - items - The acctual items to return
 *  - totalCount - total amount of items available
 */
export const paginateResponse = async (ctx, next) => {
    let offset = ctx.state.offset
    let count = ctx.state.count
    let apiPaginationEndpoint = ctx.state.apiPaginationEndpoint
    let response = ctx.state.response

    // Checking input 

    if(!isNumber(offset) || offset < 0)
        throw Error('Missing property "offset" in state object or "offset" <= 0')

    if(!isNumber(count) || count <= 0) 
        throw Error('Missing property "count" in state object or "count" <= 0')

    if(!isString(apiPaginationEndpoint))
        throw Error('Missing property "apiPaginationEndpoint" in state object or proprty is not string')

    if(!response)
        throw Error('The response object is null or undefined')

    if(!isArray(response.items) || response.items.length === 0)
        throw Error('Items should be non empty array')

    if(!isNumber(response.totalCount) || response.totalCount < 0)
        throw Error('totalCount should be a number > 0')
    

    //Paginate

    let pagination: any = {
        items: response.items,
        requestOffset: offset,
        requestCount: count,
        totalCount: response.totalCount
    }
    
    ctx.state.response = apiPagination.toRest(pagination, apiPaginationEndpoint)
    
    next && await next()
}