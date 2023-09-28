import { ScanCommand } from '@aws-sdk/client-dynamodb';
import { db } from '../../../services/db';
import middy from '@middy/core';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { sendBodyResponse, sendErrorResponse } from '../../../responses';

export async function getQuiz(id: any) {
  const command = new ScanCommand({
    TableName: 'Quiztopia',
    FilterExpression: 'begins_with(PK, :PK) AND SK = :SK',
    ExpressionAttributeValues: {
      ':PK': { S: 'quiz#' },
      ':SK': { S: 'id#' + id },
    },
    ProjectionExpression: 'QuizName, Creator, Questions',
  });

  try {
    const { Items } = await db.send(command);
    const result = Items?.map((quiz) => {
      return {
        creator: quiz.Creator.S,
        questions: quiz.Questions.L?.map((question) => {
          return {
            question: question?.M?.Question.S,
            answer: question?.M?.Answer.S,
            coordinates: {
              latitude: question?.M?.Coordinates?.M?.Latitude.S,
              longitude: question?.M?.Coordinates?.M?.Longitude.S,
            },
          };
        }),
      };
    });
    return result;
  } catch (error) {
    throw error;
  }
}

async function lambda(event: APIGatewayProxyEvent) {
  const { id } = event.pathParameters as any;
  console.log(id);
  try {
    const quiz = await getQuiz(id);
    return sendBodyResponse(200, { quiz });
  } catch (error) {
    return sendErrorResponse(error);
  }
}

export const handler = middy(lambda);
