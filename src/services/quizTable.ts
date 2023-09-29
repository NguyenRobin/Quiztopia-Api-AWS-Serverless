import {
  BatchWriteItemCommand,
  QueryCommand,
  ScanCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import { db } from './db';
import {
  createAttributeExpression,
  createKeyCondition,
} from '../functions/authentication/addQuestionToQuiz/helpers';
import { Quiz } from '../interfaces/quiz';
import { generateDate } from '../utils/generateDate';

export async function getQuiz(id: string) {
  const command = new QueryCommand({
    TableName: 'Quiztopia',
    KeyConditionExpression: 'PK = :PK AND begins_with(SK, :SK)',
    ExpressionAttributeValues: {
      ':PK': { S: 'id#' + id },
      ':SK': { S: 'quiz#' },
    },
    ProjectionExpression: 'QuizName, Creator, Questions',
  });
  try {
    const { Items } = await db.send(command);

    if (!Items || !Items?.length) {
      throw { statusCode: 404, message: 'No quiz with matching ID' };
    }

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

export async function getAllQuiz() {
  const command = new ScanCommand({
    TableName: 'Quiztopia',
    FilterExpression: 'begins_with(PK, :PK) and begins_with(SK, :SK)',
    ExpressionAttributeValues: {
      ':PK': { S: 'id#' },
      ':SK': { S: 'quiz#' },
    },
  });

  try {
    const { Items } = await db.send(command);
    if (!Items) {
      throw { statusCode: 400, message: 'Bad Request' };
    }

    const quizTopics = Items?.map((quiz) => {
      console.log(quiz);
      return {
        id: quiz.Id.S,
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

export async function getQuizName(email: string, quizId: string) {
  const command = new QueryCommand({
    TableName: 'Quiztopia',
    KeyConditionExpression: 'PK = :PK AND SK = :SK',
    ExpressionAttributeValues: {
      ':PK': { S: 'user#' + email },
      ':SK': { S: 'id#' + quizId },
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

export async function createQuiz(newQuiz: Quiz, quizOwner: Quiz) {
  const newQuizItem = {
    PK: { S: 'id#' + newQuiz.pk },
    SK: { S: 'quiz#' + newQuiz.quizName },
    EntityType: { S: 'quiz' },
    QuizName: { S: newQuiz.quizName },
    Questions: {
      L: newQuiz.questions.map((question) => ({
        M: {
          Question: { S: question.question },
          Answer: { S: question.answer },
          Coordinates: {
            M: {
              Latitude: { S: question.coordinates.latitude },
              Longitude: { S: question.coordinates.longitude },
            },
          },
        },
      })),
    },
    Id: { S: newQuiz.id },
    CreatedAt: { S: generateDate() },
    Creator: { S: newQuiz.creator },
  };

  const newQuizOwner = {
    PK: { S: 'user#' + quizOwner.pk },
    SK: { S: 'id#' + quizOwner.id },
    EntityType: { S: 'quiz' },
    QuizName: { S: quizOwner.quizName },
    Questions: {
      L: quizOwner.questions.map((question) => ({
        M: {
          Question: { S: question.question },
          Answer: { S: question.answer },
          Coordinates: {
            M: {
              Latitude: { S: question.coordinates.latitude },
              Longitude: { S: question.coordinates.longitude },
            },
          },
        },
      })),
    },
    Id: { S: quizOwner.id },
    CreatedAt: { S: generateDate() },
    Creator: { S: quizOwner.creator },
  };
  const command = new BatchWriteItemCommand({
    RequestItems: {
      Quiztopia: [
        { PutRequest: { Item: newQuizItem } },
        { PutRequest: { Item: newQuizOwner } },
      ],
    },
  });

  try {
    const response = await db.send(command);
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

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
    return response;
  } catch (error) {
    throw error;
  }
}
