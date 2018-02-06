export declare const mapPropertyDown: (source: string, target: string, defaultValue?: any) => (ctx: any, next?: any) => Promise<void>;
export declare const mapPropertyUp: (source: string, target: string, defaultValue?: any) => (ctx: any, next?: any) => Promise<void>;
export declare const putEventToState: (variableName: string) => (ctx: any, next?: any) => Promise<void>;
export declare const filterEventProperty: (variableName: string, filterFunction: (record: any) => boolean) => (ctx: any, next?: any) => Promise<void>;
