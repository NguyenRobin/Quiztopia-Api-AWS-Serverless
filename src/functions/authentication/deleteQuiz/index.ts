import { BatchWriteItemCommand } from '@aws-sdk/client-dynamodb';
import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { getToken, getTokenOwner } from '../../../jwt';
import { sendBodyResponse, sendErrorResponse } from '../../../responses';
import { getQuizName } from '../../../services/quizTable';
import { createKeyCondition } from '../addQuestionToQuiz/helpers';
import { db } from '../../../services/db';

export async function deleteQuiz(
  email: string,
  quizId: string,
  quizName: string
) {
  const command = new BatchWriteItemCommand({
    RequestItems: {
      Quiztopia: [
        {
          DeleteRequest: {
            Key: createKeyCondition('user', email, 'id', quizId),
          },
        },
        {
          DeleteRequest: {
            Key: createKeyCondition('id', quizId, 'quiz', quizName),
          },
        },
      ],
    },
  });

  try {
    const response = await db.send(command);
    console.log(response);
    return response;
  } catch (error) {
    throw error;
  }
}

async function lambda(event: APIGatewayProxyEvent) {
  try {
    const token = getToken(event);
    const { id } = event.pathParameters as any;
    const { email } = await getTokenOwner(token!);
    const quizName = (await getQuizName(email, id)) as any;

    await deleteQuiz(email, id, quizName);
    return sendBodyResponse(200, { email, quizName });
  } catch (error) {
    return sendErrorResponse(error);
  }
}

export const handler = middy(lambda).use(jsonBodyParser());
