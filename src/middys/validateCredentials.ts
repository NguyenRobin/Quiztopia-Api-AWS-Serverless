import middy from '@middy/core';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { sendErrorResponse } from '../responses';
import { UserCredentials } from '../interfaces/users';

export const validateCredentials =
  (): middy.MiddlewareObj<APIGatewayProxyEvent> => {
    const before: middy.MiddlewareFn<APIGatewayProxyEvent> = async (
      request
    ) => {
      try {
        const { ...body } = request?.event?.body as unknown as UserCredentials;

        if (!body.email || !body.password) {
          throw {
            statusCode: 400,
            message: 'Email and Password are required.',
          };
        }
      } catch (error: any) {
        return sendErrorResponse(error);
      }
    };
    return { before };
  };
