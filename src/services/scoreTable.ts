import { PutItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import { UserScore } from '../interfaces/users';
import { db } from './db';
import { sendErrorResponse } from '../responses';

export async function addScore(user: UserScore) {
  const command = new PutItemCommand({
    TableName: 'Quiztopia',
    Item: {
      PK: { S: 'id#' + user.quizId },
      SK: { S: 'user#' + user.user },
      Score: { N: user.score.toString() },
      EntityType: { S: user.entityType },
    },
  });

  try {
    const response = await db.send(command);
    return response;
  } catch (error: any) {
    console.error(error);
    return sendErrorResponse(error);
  }
}

export async function getTopScorers(id: string) {
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
    })
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 5);

    return result;
  } catch (error) {
    throw error;
  }
}
