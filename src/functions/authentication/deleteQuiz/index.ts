import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { getToken, getTokenOwner } from '../../../jwt';
import { sendErrorResponse, sendResponse } from '../../../responses';
import { deleteQuiz, getQuiz, getQuizName } from '../../../services/quizTable';
import { Params } from '../../../interfaces';
import { validateToken } from '../../../middys/validateToken';

async function lambda(event: APIGatewayProxyEvent) {
  try {
    const { id } = event.pathParameters as unknown as Params;
    const token = getToken(event);

    if (token !== undefined) {
      const { email } = await getTokenOwner(token);
      const quiz = await getQuiz(id);
      const quizName = await getQuizName(email, id);

      if (quizName !== undefined) {
        await deleteQuiz(email, id, quizName);
      }
    }

    return sendResponse(204, 'Quiz successfully deleted');
  } catch (error) {
    return sendErrorResponse(error);
  }
}

export const handler = middy(lambda).use(validateToken()).use(jsonBodyParser());
