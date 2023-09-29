import middy from '@middy/core';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { getToken, getTokenOwner } from '../../../jwt';
import { sendErrorResponse, sendResponse } from '../../../responses';
import { generateDate } from '../../../utils/generateDate';
import { randomUUID } from 'crypto';
import jsonBodyParser from '@middy/http-json-body-parser';
import { CreateQuiz, Quiz } from '../../../interfaces/quiz';
import { validateBody } from '../../../middys/validateBody';
import { createQuiz } from '../../../services/quizTable';
import { validateToken } from '../../../middys/validateToken';

async function lambda(event: APIGatewayProxyEvent) {
  try {
    const { quizName, questions } = event.body as unknown as CreateQuiz;
    if (!quizName || !questions) {
      throw { statusCode: 400, message: 'quizName and questions is required' };
    }

    if (!Array.isArray(questions)) {
      throw {
        statusCode: 400,
        message:
          'Property: questions must be an array. Optional: include { question, answer, coordinates: { latitude, longitude } }',
      };
    }

    const token = getToken(event);
    const tokenOwner = await getTokenOwner(token!);
    const quizId = randomUUID();

    const newQuiz: Quiz = {
      pk: quizId,
      sk: quizName,
      entityType: 'quiz',
      quizName,
      questions,
      id: quizId,
      createdAt: generateDate(),
      creator: tokenOwner.email,
    };

    const quizOwner: Quiz = {
      pk: tokenOwner.email,
      sk: quizId,
      entityType: 'quiz',
      quizName,
      questions,
      id: quizId,
      createdAt: generateDate(),
      creator: tokenOwner.email,
    };

    await createQuiz(newQuiz, quizOwner);

    return sendResponse(201, 'Quiz successfully created');
  } catch (error: any) {
    console.error(error);
    return sendErrorResponse(error);
  }
}

export const handler = middy(lambda)
  .use(validateToken())
  .use(validateBody())
  .use(jsonBodyParser());
