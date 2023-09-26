import middy from '@middy/core';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { validateCredentials } from '../../../middys/validateCredentials';
import { validateBody } from '../../../middys/validateBody';
import { UserCredentials } from '../../../interfaces/users';
import jsonBodyParser from '@middy/http-json-body-parser';
import { sendBodyResponse, sendErrorResponse } from '../../../responses';
import { createToken } from '../../../jwt';
import { login } from '../../../services/usersTable';

async function lambda(event: APIGatewayProxyEvent) {
  try {
    const { email, password } = event.body as unknown as UserCredentials;
    const userIsLoggedIn = await login(email, password);
    const userEmail = userIsLoggedIn?.at(0)?.Email?.S;
    if (userIsLoggedIn && userEmail) {
      const token = createToken(userEmail);
      return sendBodyResponse(200, { token });
    }
  } catch (error) {
    return sendErrorResponse(error);
  }
}

export const handler = middy(lambda)
  .use(jsonBodyParser())
  .use(validateCredentials());
