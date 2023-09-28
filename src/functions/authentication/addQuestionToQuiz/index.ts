import middy from '@middy/core';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { getToken, getTokenOwner } from '../../../jwt';
import { sendErrorResponse, sendResponse } from '../../../responses';
import jsonBodyParser from '@middy/http-json-body-parser';
import { addQuestionToQuiz, getQuizName } from '../../../services/quizTable';
import { Question } from '../../../interfaces/quiz';

async function lambda(event: APIGatewayProxyEvent) {
  try {
    const token = getToken(event);
    const { question, answer, coordinates } = event.body as any;
    const { id } = event.pathParameters as any;
    const { email } = await getTokenOwner(token!);
    const quizName = (await getQuizName(email, id)) as any;

    const newQuestion: Question = {
      question,
      answer,
      coordinates: {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      },
    };

    await addQuestionToQuiz(email, id, quizName, newQuestion);
    return sendResponse(201, 'Quiz successfully updated');
  } catch (error: any) {
    console.error(error);
    return sendErrorResponse(error);
  }
}

export const handler = middy(lambda).use(jsonBodyParser());
