import middy from '@middy/core';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { sendBodyResponse, sendErrorResponse } from '../../../responses';
import { getQuiz } from '../../../services/quizTable';
import { Params } from '../../../interfaces';

async function lambda(event: APIGatewayProxyEvent) {
  const { id } = event.pathParameters as unknown as Params;
  try {
    const quiz = await getQuiz(id);

    return sendBodyResponse(200, {
      totalQuestions: quiz?.at(0)?.questions?.length,
      quiz,
    });
  } catch (error) {
    return sendErrorResponse(error);
  }
}

export const handler = middy(lambda);
