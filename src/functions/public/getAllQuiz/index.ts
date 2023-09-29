import middy from '@middy/core';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { sendBodyResponse, sendErrorResponse } from '../../../responses';
import { getAllQuiz } from '../../../services/quizTable';

async function lambda(event: APIGatewayProxyEvent) {
  try {
    const allQuiz = await getAllQuiz();
    return sendBodyResponse(200, { result: allQuiz?.length, quiz: allQuiz });
  } catch (error) {
    return sendErrorResponse(error);
  }
}

export const handler = middy(lambda);
