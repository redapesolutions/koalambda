export declare const mapPropertyDown: (source: string, target: string, defaultValue?: any) => (ctx: any, next?: any) => Promise<void>;
export declare const mapPropertyUp: (source: string, target: string, defaultValue?: any) => (ctx: any, next?: any) => Promise<void>;
export declare const putEventToState: (variableName: string) => (ctx: any, next?: any) => Promise<void>;
export declare const filterProperty: (variableName: string, filterFunction: (record: any) => boolean) => (ctx: any, next?: any) => Promise<void>;
export declare const putEnvVariableToState: (envVariableName: string, variableStatePath?: string) => (ctx: any, next?: any) => Promise<void>;
export declare const executeInOrder: (stopCondition: (ctx: any) => boolean, ...functions: any[]) => (ctx: any, next?: any) => Promise<void>;
export declare const setValue: (paramName: string, valueSetter: (ctx: any) => any) => (ctx: any, next?: any) => Promise<void>;
