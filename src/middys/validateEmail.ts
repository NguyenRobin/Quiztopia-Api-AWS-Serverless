import middy from '@middy/core';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { sendErrorResponse } from '../responses';

function emailFormat(email: string) {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
}

export const validateEmail = (): middy.MiddlewareObj<APIGatewayProxyEvent> => {
  const before: middy.MiddlewareFn<APIGatewayProxyEvent> = async (request) => {
    try {
      const email = request?.event?.body;
      console.log('email', email);
      if (email) {
        if (!emailFormat(email)) {
          throw { statusCode: 400, message: 'Email format is not accepted' };
        }
      }
    } catch (error: any) {
      return sendErrorResponse(error);
    }
  };
  return { before };
};
