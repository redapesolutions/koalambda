export declare const when: (check: (ctx: any) => Boolean | Promise<Boolean>, middleware: (ctx: any, next: any) => Promise<any>) => (ctx: any, next: any) => Promise<void>;
export declare const whenAttributeExists: (attr: string, middleware: (ctx: any, next: any) => Promise<any>) => (ctx: any, next: any) => Promise<void>;
export declare const whenAttributeEquals: (attr: string, compare: any, middleware: (ctx: any, next: any) => Promise<any>) => (ctx: any, next: any) => Promise<void>;
