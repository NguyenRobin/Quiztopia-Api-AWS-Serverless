import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { UserScore } from '../interfaces/users';
import { db } from './db';
import { sendErrorResponse } from '../responses';

export async function addScore(user: UserScore) {
  console.log(user.quizId);
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
    // if (error.name === 'ConditionalCheckFailedException') {
    // throw new Error('Quiz id not found');
    // } else {
    return sendErrorResponse(error);
  }
}
// }
