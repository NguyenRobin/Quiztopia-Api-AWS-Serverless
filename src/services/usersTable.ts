import { PutItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
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

export async function login(email: string, password: string) {
  const command = new QueryCommand({
    TableName: 'Quiztopia',
    KeyConditionExpression: 'PK = :requestPK AND SK = :requestSK',
    ExpressionAttributeValues: {
      ':requestPK': { S: 'u#' + email },
      ':requestSK': { S: 'u#' + email },
    },
  });

  try {
    const { Items: user } = await db.send(command);

    if (!user || !user.length) {
      throw { statusCode: 401, message: 'Email not found!' };
    }

    if (password !== user?.at?.(0)?.Password.S) {
      throw {
        statusCode: 401,
        message: 'Passwords credentials are not matching',
      };
    }
    return user;
  } catch (error) {
    throw error;
  }
}
