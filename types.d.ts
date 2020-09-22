import { APIGatewayProxyEvent } from '@types/aws-lambda'

export type HttpFunction = Controller & {
  method?: string
  path?: string
}

export type HttpResource = Record<string, Handler | Controller> & {
  path?: string
}

type Controller = {
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
    | Partial<Response>
    | Promise<void | Partial<Response>>
}

export type Request = APIGatewayProxyEvent & {
  body: any
  method: APIGatewayProxyEvent['httpMethod']
  params: Record<string, string>
  query: APIGatewayProxyEvent['queryStringParameters']
}

export type Context = Record<string, any>

export type Response = {
  statusCode: number
  body: any
  headers: Record<string, string>
  isBase64Encoded: boolean
}
