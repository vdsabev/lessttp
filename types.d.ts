import { APIGatewayProxyEvent } from '@types/aws-lambda'

export type Controller = {
  method?: string
  path?: string
  request?: RequestValidation
  middleware?: Handler[] | (() => Handler[])
  handler: Handler
}

export type RequestValidation = Record<string, any>

export interface Middleware<Args = []> {
  (...args: Args): Handler
}

export interface Handler {
  (request: Request, context: Context):
    | void
    | Response
    | Promise<void | Response>
}

export type Request = APIGatewayProxyEvent & {
  body: any
  method: APIGatewayProxyEvent['httpMethod']
  params: Record<string, string>
  query: APIGatewayProxyEvent['queryStringParameters']
}

export type Context = Record<string, any>

export type Response = {
  statusCode?: number
  body?: any
  headers?: Record<string, string>
}
