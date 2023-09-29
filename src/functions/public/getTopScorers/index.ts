import middy from '@middy/core';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { sendBodyResponse, sendErrorResponse } from '../../../responses';
import { QueryCommand } from '@aws-sdk/client-dynamodb';
import { db } from '../../../services/db';
import { getQuiz } from '../../../services/quizTable';
import { Params } from '../../../interfaces';
import { getTopScorers } from '../../../services/scoreTable';

async function lambda(event: APIGatewayProxyEvent) {
  try {
    const { id } = event.pathParameters as unknown as Params;
    const quiz = await getQuiz(id);
    const quizTopScorers = await getTopScorers(id);
    return sendBodyResponse(200, {
      quizName: quiz.at(0)?.quizName,
      topFiveScorers: quizTopScorers,
    });
  } catch (error) {
    return sendErrorResponse(error);
  }
}

export const handler = middy(lambda);
