import {
  QueryCommand,
  ScanCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import { db } from './db';
import {
  createAttributeExpression,
  createKeyCondition,
} from '../functions/authentication/addQuestionToQuiz/helpers';

export async function getQuiz(id: any) {
  const command = new ScanCommand({
    TableName: 'Quiztopia',
    FilterExpression: 'PK = :PK AND begins_with(SK, :SK)',
    ExpressionAttributeValues: {
      ':PK': { S: 'id#' + id },
      ':SK': { S: 'quiz#' },
    },
    ProjectionExpression: 'QuizName, Creator, Questions',
  });
  try {
    const { Items } = await db.send(command);

    const result = Items?.map((quiz) => {
      return {
        creator: quiz.Creator.S,
        quizName: quiz.QuizName.S,
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

export async function getQuizName(email: string, quizId: string) {
  const command = new QueryCommand({
    TableName: 'Quiztopia',
    KeyConditionExpression: 'PK = :email AND SK = :quizId',
    ExpressionAttributeValues: {
      ':email': { S: 'user#' + email },
      ':quizId': { S: 'id#' + quizId },
    },
    ProjectionExpression: 'QuizName',
  });

  try {
    const { Items } = await db.send(command);
    if (!Items || !Items.length) {
      throw {
        statusCode: 401,
        message: 'Authentication failed You cannot access this quiz.',
      };
    }
    return Items?.at(0)?.QuizName.S;
  } catch (error) {
    throw error;
  }
}

export async function addQuestionToQuiz(
  email: string,
  quizId: string,
  quizName: string,
  question: object
) {
  const commandUpdateUserQuizItem = new UpdateItemCommand({
    TableName: 'Quiztopia',
    Key: createKeyCondition('user', email, 'id', quizId),
    UpdateExpression: 'SET Questions = list_append(Questions, :question)',
    ExpressionAttributeValues: createAttributeExpression(question),
  });

  const commandUpdateQuizItem = new UpdateItemCommand({
    TableName: 'Quiztopia',
    Key: createKeyCondition('id', quizId, 'quiz', quizName),
    UpdateExpression: 'SET Questions = list_append(Questions, :question)',
    ExpressionAttributeValues: createAttributeExpression(question),
  });
  const commands = [commandUpdateUserQuizItem, commandUpdateQuizItem];

  try {
    for (let i = 0; i < commands.length; i++) {
      if (!commands[i]) {
        throw {
          statusCode: 400,
          message: 'Question could not be added to quiz',
        };
      }
      await db.send(commands[i]);
    }
  } catch (error) {
    throw error;
  }
}
