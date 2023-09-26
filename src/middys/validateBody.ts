import middy from '@middy/core';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { sendErrorResponse } from '../responses';

export const validateBody = (): middy.MiddlewareObj<APIGatewayProxyEvent> => {
  const before: middy.MiddlewareFn<APIGatewayProxyEvent> = async (request) => {
    try {
      const { body } = request?.event;

      if (!body) {
        throw { statusCode: 400, message: 'Body is required' };
      }
    } catch (error: any) {
      return sendErrorResponse(error);
    }
  };
  return { before };
};
