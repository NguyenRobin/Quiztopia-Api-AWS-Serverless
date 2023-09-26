import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { validateBody } from '../../middys/validateBody';
import { sendErrorResponse, sendResponse } from '../../responses';
import { generateDate } from '../../utils/generateDate';
import { validateEmail } from '../../middys/validateEmail';
import { SignupRequest, SignupUser } from '../../interfaces/users';
import { signupUser } from '../../services/usersTable';

async function lambdaHandler(event: APIGatewayProxyEvent) {
  try {
    if (event.body !== null && typeof event.body === 'object') {
      const { email, password }: SignupRequest = event.body;

      if (!email || !password) {
        throw {
          statusCode: 401,
          message: '"Email" and "Password" is required',
        };
      } else {
        const user: SignupUser = {
          pk: email,
          sk: email,
          entityType: 'users',
          email,
          password,
          createdAt: generateDate(),
        };
        await signupUser(user);
        return sendResponse(201, 'User successfully created');
      }
    }
  } catch (error: any) {
    return sendErrorResponse(error);
  }
}

export const handler = middy(lambdaHandler)
  .use(validateBody())
  .use(jsonBodyParser());
