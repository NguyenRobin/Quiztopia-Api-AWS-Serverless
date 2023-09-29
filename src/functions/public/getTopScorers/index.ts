import middy from '@middy/core';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { sendBodyResponse, sendErrorResponse } from '../../../responses';
import { QueryCommand } from '@aws-sdk/client-dynamodb';
import { db } from '../../../services/db';

export async function getTopScorers(id: any) {
  const command = new QueryCommand({
    TableName: 'Quiztopia',
    KeyConditionExpression: 'PK = :PK AND begins_with(SK, :SK)',
    ExpressionAttributeValues: {
      ':PK': { S: 'id#' + id },
      ':SK': { S: 'user#' },
    },
    ProjectionExpression: 'SK, Score',
  });
  try {
    const { Items } = await db.send(command);
    const result = Items?.map((quiz) => {
      return {
        score: quiz.Score.N,
        user: quiz.SK.S?.split('#').at(1),
      };
    }).sort((a: any, b: any) => b.score - a.score);

    return result;
  } catch (error) {
    throw error;
  }
}

async function lambda(event: APIGatewayProxyEvent) {
  const { id } = event.pathParameters as any;
  console.log(id);
  try {
    const quiz = await getTopScorers(id);
    return sendBodyResponse(200, {
      // totalQuestions: quiz?.at(0)?.questions?.length,
      topFiveScorers: quiz,
    });
  } catch (error) {
    return sendErrorResponse(error);
  }
}

export const handler = middy(lambda);
