export declare enum ERROR_CODES {
    JSON_PARSING_ERROR = 100,
    MISSING_BODY = 101,
}
export declare const jsonBody: (ctx: any, next?: any) => Promise<void>;
export declare const _makeResponse: (body: {
    [prop: string]: any;
}, statusCode?: number, cors?: boolean, headers?: {
    [prop: string]: any;
}) => {
    statusCode: number;
    headers: {
        'Content-Type': string;
    };
    body: string;
};
export declare const _callbackBasedHttpHandleError: (err: any) => {
    statusCode: number;
    headers: {
        'Content-Type': string;
    };
    body: string;
};
export declare const makeResponse: (statusCode?: number, cors?: boolean, headers?: {
    [prop: string]: any;
}) => (ctx: any, next: any) => Promise<void>;
export declare const makeError: (message: string, statusCode?: number, cors?: boolean, internalErrorCode?: number) => {
    statusCode: number;
    headers: {
        'Content-Type': string;
    };
    body: string;
};
export declare const makeSuccess: (ctx: any, next: any) => Promise<void>;
export declare const httpResponse: (successCode?: number, errorCode?: number, cors?: boolean, headers?: {
    [prop: string]: any;
}) => (ctx: any, next: any) => Promise<void>;
export declare const standardHttpResponse: (ctx: any, next: any) => Promise<void>;
