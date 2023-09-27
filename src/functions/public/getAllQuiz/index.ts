import { ScanCommand } from '@aws-sdk/client-dynamodb';
import { db } from '../../../services/db';
import middy from '@middy/core';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { sendBodyResponse, sendErrorResponse } from '../../../responses';

export async function getAllQuiz() {
  const command = new ScanCommand({
    TableName: 'Quiztopia',
    FilterExpression: 'begins_with(PK, :PK) and begins_with(SK, :SK)',
    ExpressionAttributeValues: {
      ':PK': { S: 'quiz#' },
      ':SK': { S: 'id#' },
    },
  });

  try {
    const { Items } = await db.send(command);

    const quizTopics = Items?.map((quiz) => {
      console.log(quiz);
      return {
        quiz: quiz.QuizName.S,
        creator: quiz.Creator.S,
        questions: quiz?.Questions?.L?.map((item) => {
          return {
            question: item.M?.Question.S,
            answer: item.M?.Answer.S,
            coordinates: {
              latitude: item.M?.Coordinates?.M?.Latitude?.S,
              longitude: item.M?.Coordinates?.M?.Longitude?.S,
            },
          };
        }),
      };
    });

    return quizTopics;
  } catch (error) {
    throw error;
  }
}

async function lambda(event: APIGatewayProxyEvent) {
  try {
    const allQuiz = await getAllQuiz();
    return sendBodyResponse(200, { result: allQuiz?.length, quiz: allQuiz });
  } catch (error) {
    return sendErrorResponse(error);
  }
}

export const handler = middy(lambda);
