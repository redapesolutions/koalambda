import { APIGatewayEvent, CognitoUserPoolEvent, Context } from 'aws-lambda';
export declare type AsyncFunction = (EventContext, Function?) => Promise<any>;
export declare type EventContext = {
    event: (APIGatewayEvent | CognitoUserPoolEvent);
    context: Context;
    state: {
        [prop: string]: any;
    };
    callback?: Function;
};
