import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { sendErrorResponse } from '../responses';
import { db } from './db';
import { SignupUser } from '../interfaces/users';

export async function signupUser(user: SignupUser) {
  const command = new PutItemCommand({
    TableName: 'Quiztopia',
    Item: {
      PK: { S: 'u#' + user.pk },
      SK: { S: 'u#' + user.sk },
      EntityType: { S: user.entityType },
      Email: { S: user.email },
      Password: { S: user.password },
      CreatedAt: { S: user.createdAt },
    },
    ConditionExpression: `attribute_not_exists(Email)`,
  });

  try {
    const response = await db.send(command);
    return response;
  } catch (error: any) {
    console.error(error);
    if (error.name === 'ConditionalCheckFailedException') {
      throw new Error('Email already exists');
    } else {
      return sendErrorResponse(error);
    }
  }
}
