import middy from '@middy/core';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { sendErrorResponse } from '../responses';
export const jwt = require('jsonwebtoken');

export const validateToken = (): middy.MiddlewareObj<APIGatewayProxyEvent> => {
  const before: middy.MiddlewareFn<APIGatewayProxyEvent> = async (request) => {
    try {
      const token = request?.event?.headers?.authorization
        ?.replace('Bearer ', '')
        .trim();

      if (!token) {
        throw {
          statusCode: 401,
          message: 'Valid token most be provided in headers',
        };
      }

      const isTokenValid = await jwt.verify(token, `${process.env.SECRET_KEY}`);

      if (!isTokenValid) {
        throw { statusCode: 401, message: 'Invalid token' };
      }
    } catch (error: any) {
      return sendErrorResponse(error);
    }
  };
  return { before };
};
