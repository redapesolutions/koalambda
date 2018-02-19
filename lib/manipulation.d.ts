export declare const mapPropertyDown: (source: string, target: string, defaultValue?: any) => (ctx: any, next?: any) => Promise<void>;
export declare const mapPropertyUp: (source: string, target: string, defaultValue?: any) => (ctx: any, next?: any) => Promise<void>;
export declare const putEventToState: (variableName: string) => (ctx: any, next?: any) => Promise<void>;
export declare const filterProperty: (variableName: string, filterFunction: (record: any) => boolean) => (ctx: any, next?: any) => Promise<void>;
export declare const putEnvVariableToState: (envVariableName: string, variableStatePath?: string) => (ctx: any, next?: any) => Promise<void>;
export declare const executeInOrder: (stopCondition: (ctx: any) => boolean, ...functions: any[]) => (ctx: any, next?: any) => Promise<void>;
/** This function requiers to have two properties specified in the state:
 *  - 'offset' - number of skipped elemnets,
 *  - 'count' - number of elements per page
 *  - 'apiPaginationEndpoint' - the base url (ex. www.a.eu) for pages, result will look like http://www.a.eu/test?offest=1&count=2
 *
 * It also requires response to have properties:
 *  - items - The acctual items to return
 *  - totalCount - total amount of items available
 */
export declare const paginateResponse: (ctx: any, next: any) => Promise<void>;
