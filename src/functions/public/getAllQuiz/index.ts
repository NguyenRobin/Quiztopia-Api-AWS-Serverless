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
      ':PK': { S: 'quizCategory#' },
      ':SK': { S: 'quiz#' },
    },
  });

  try {
    const { Items } = await db.send(command);
    const quizTopics = Items?.map((quiz) => {
      return {
        quizCategory: quiz.QuizName.S,
        creator: quiz.Creator.S,
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
    console.log(allQuiz);
    return sendBodyResponse(200, { result: allQuiz?.length, quiz: allQuiz });
  } catch (error) {
    return sendErrorResponse(error);
  }
}

export const handler = middy(lambda);
