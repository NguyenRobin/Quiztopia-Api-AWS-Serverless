import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { validateBody } from '../../../middys/validateBody';
import { sendErrorResponse, sendResponse } from '../../../responses';
import { generateDate } from '../../../utils/generateDate';
import { validateEmail } from '../../../middys/validateEmail';
import { UserScore } from '../../../interfaces/users';
import { addScore } from '../../../services/scoreTable';

async function lambdaHandler(event: APIGatewayProxyEvent) {
  try {
    if (event.body !== null && typeof event.body === 'object') {
      const { quizId, user, score }: UserScore = event.body;

      if (!quizId || !user || !score) {
        throw {
          statusCode: 401,
          message: 'quizId, user and score is required',
        };
      } else {
        const userScoreDetails: UserScore = {
          quizId,
          user,
          score,
          entityType: 'QuizTopScore',
        };
        console.log(quizId);
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
