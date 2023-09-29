import middy from '@middy/core';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { getToken, getTokenOwner } from '../../../jwt';
import { sendErrorResponse, sendResponse } from '../../../responses';
import jsonBodyParser from '@middy/http-json-body-parser';
import { addQuestionToQuiz, getQuizName } from '../../../services/quizTable';
import { Question } from '../../../interfaces/quiz';
import { validateToken } from '../../../middys/validateToken';
import { Params } from '../../../interfaces';
import { validateBody } from '../../../middys/validateBody';

async function lambda(event: APIGatewayProxyEvent) {
  try {
    const { question, answer, coordinates } = event.body as unknown as Question;
    const { id } = event.pathParameters as unknown as Params;
    const token = getToken(event);

    if (!question || !answer || !coordinates) {
      throw {
        statusCode: 400,
        message: 'question, answer and coordinates is required',
      };
    }

    if (typeof coordinates !== 'object') {
      throw {
        statusCode: 400,
        message:
          'Property: coordinates must be an object. Example: coordinates: { latitude: string, longitude: string } ',
      };
    }

    if (token !== undefined) {
      const { email } = await getTokenOwner(token);
      const quizName = await getQuizName(email, id);

      const newQuestion: Question = {
        question,
        answer,
        coordinates: {
          latitude: coordinates?.latitude,
          longitude: coordinates?.longitude,
        },
      };

      if (quizName !== undefined) {
        await addQuestionToQuiz(email, id, quizName, newQuestion);
        return sendResponse(201, 'Quiz successfully updated');
      }
    }
  } catch (error: any) {
    console.error(error);
    return sendErrorResponse(error);
  }
}

export const handler = middy(lambda)
  .use(validateToken())
  .use(validateBody())
  .use(jsonBodyParser());
