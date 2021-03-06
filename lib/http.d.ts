export declare enum HTTP_ERROR_CODES {
    JSON_PARSING_ERROR = 100,
    MISSING_BODY = 101,
}
export declare const jsonBody: (ctx: any, next?: any) => Promise<void>;
export declare const validateBodyWithJsonSchema: (schema: any) => (ctx: any, next?: any) => Promise<void>;
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
export declare const _makeBadRequest: (message: any) => {
    statusCode: number;
    headers: {
        'Content-Type': string;
    };
    body: string;
};
export declare const _makeUnauthorized: (message: any) => {
    statusCode: number;
    headers: {
        'Content-Type': string;
    };
    body: string;
};
export declare const _makeForbidden: (message: any) => {
    statusCode: number;
    headers: {
        'Content-Type': string;
    };
    body: string;
};
export declare const _makeRedirect: (redirectUrl: string) => {
    statusCode: number;
    headers: {
        'Content-Type': string;
    };
    body: string;
};
export declare const _callbackBasedHttpHandleError: (err: any) => Promise<{
    statusCode: number;
    headers: {
        'Content-Type': string;
    };
    body: string;
}>;
export declare const makeResponse: (statusCode?: number, cors?: boolean, headers?: {
    [prop: string]: any;
}) => (ctx: any, next: any) => Promise<void>;
export declare const _makeError: (message: string, statusCode?: number, cors?: boolean, internalErrorCode?: number) => {
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
export declare const redirectHttpResponse: (linkLocation: string) => (ctx: any, next: any) => Promise<void>;
export declare class ForbiddenError {
    message: any;
    constructor(message: any);
}
export declare class UnauthorizedError {
    message: any;
    constructor(message: any);
}
