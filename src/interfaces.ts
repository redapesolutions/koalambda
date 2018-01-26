import {APIGatewayEvent, CognitoUserPoolEvent, Context} from 'aws-lambda'

export type AsyncFunction = (EventContext, Function?) => Promise<any>
export type EventContext = {
  event: (APIGatewayEvent | CognitoUserPoolEvent) & {[prop:string]: any},
  context: Context,
  callback?: Function
}