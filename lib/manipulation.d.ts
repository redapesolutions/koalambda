export declare const mapPropertyDown: (source: string, target: string, defaultValue?: any) => (ctx: any, next?: any) => Promise<void>;
export declare const mapPropertyUp: (source: string, target: string, defaultValue?: any) => (ctx: any, next?: any) => Promise<void>;
export declare const putInState: (variableName: string) => Promise<(ctx: any, next?: any) => Promise<void>>;
export declare const filter: (variableName: string, compareFunction: (record: any) => boolean) => Promise<(ctx: any, next?: any) => Promise<void>>;
