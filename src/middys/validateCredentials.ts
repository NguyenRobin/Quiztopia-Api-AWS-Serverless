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
        const { email, password } = request?.event
          ?.body as unknown as UserCredentials;

        if (!email || !password) {
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
