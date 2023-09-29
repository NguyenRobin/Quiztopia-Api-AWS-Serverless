import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { validateBody } from '../../../middys/validateBody';
import { sendErrorResponse, sendResponse } from '../../../responses';
import { UserScore } from '../../../interfaces/users';
import { addScore } from '../../../services/scoreTable';
import { getQuiz } from '../../../services/quizTable';

async function lambdaHandler(event: APIGatewayProxyEvent) {
  try {
    if (event.body !== null && typeof event.body === 'object') {
      const { quizId, user, score } = event.body as unknown as UserScore;

      if (!quizId || !user || !score) {
        throw {
          statusCode: 401,
          message: 'Property: quizId, user and score is required',
        };
      } else {
        await getQuiz(quizId);
        const userScoreDetails: UserScore = {
          quizId,
          user,
          score,
          entityType: 'quizTopScore',
        };
        await addScore(userScoreDetails);
        return sendResponse(201, 'Score successfully created');
      }
    }
  } catch (error: any) {
    return sendErrorResponse(error);
  }
}

export const handler = middy(lambdaHandler)
  .use(validateBody())
  .use(jsonBodyParser());
