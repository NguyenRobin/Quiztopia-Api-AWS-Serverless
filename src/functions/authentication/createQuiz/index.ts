import middy from '@middy/core';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { getToken, getTokenOwner } from '../../../jwt';
import { sendBodyResponse, sendErrorResponse } from '../../../responses';
import {
  BatchWriteItemCommand,
  PutItemCommand,
} from '@aws-sdk/client-dynamodb';
import { db } from '../../../services/db';
import { generateDate } from '../../../utils/generateDate';
import { randomUUID } from 'crypto';
import jsonBodyParser from '@middy/http-json-body-parser';

interface Quiz {
  pk: string;
  sk: string;
  entityType: string;
  id: string;
  quizName: string;
  question: string;
  answer: string;
  coordinates: { latitude: string; longitude: string };
  createdAt: string;
  creator: string;
  modified?: string;
}

async function createQuiz(quiz: Quiz, test: Quiz) {
  const userQuiz = {
    PK: { S: 'user#' + quiz.pk },
    SK: { S: 'quiz#' + quiz.sk },
    EntityType: { S: 'quiz' },
    QuizName: { S: quiz.quizName },
    Question: { S: quiz.question },
    Answer: { S: quiz.answer },
    Coordinates: {
      M: {
        latitude: { S: quiz.coordinates?.latitude },
        longitude: { S: quiz.coordinates?.longitude },
      },
    },
    Id: { S: 'quiz#' + quiz.id },
    CreatedAt: { S: generateDate() },
    Creator: { S: quiz.creator },
  };

  const newQuiz = {
    PK: { S: 'quizCategory#' + test.quizName },
    SK: { S: 'quiz#' + test.id },
    EntityType: { S: 'quizCategory' },
    QuizName: { S: test.quizName },
    Question: { S: test.question },
    Answer: { S: test.answer },
    Coordinates: {
      M: {
        latitude: { S: test.coordinates?.latitude },
        longitude: { S: test.coordinates?.longitude },
      },
    },
    CreatedAt: { S: generateDate() },
    Creator: { S: test.creator },
  };

  const command = new BatchWriteItemCommand({
    RequestItems: {
      Quiztopia: [
        { PutRequest: { Item: userQuiz } },
        { PutRequest: { Item: newQuiz } },
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

async function lambda(event: APIGatewayProxyEvent) {
  try {
    const { quizName, question, answer, coordinates } = event.body as any;
    const token = getToken(event);
    const tokenOwner = await getTokenOwner(token!);
    const quizId = randomUUID();

    const quiz: Quiz = {
      pk: tokenOwner.email,
      sk: quizId,
      entityType: 'user',
      quizName,
      question,
      answer,
      coordinates: {
        latitude: coordinates?.latitude,
        longitude: coordinates?.longitude,
      },
      id: quizId,
      createdAt: generateDate(),
      creator: tokenOwner.email,
    };

    const quiztopia: Quiz = {
      pk: quizName,
      sk: quizId,
      entityType: 'quizCategory',
      id: quizId,
      quizName,
      question,
      answer,
      coordinates: {
        latitude: coordinates?.latitude,
        longitude: coordinates?.longitude,
      },
      createdAt: generateDate(),
      creator: tokenOwner.email,
    };

    await createQuiz(quiz, quiztopia);

    return sendBodyResponse(200, { token, tokenOwner, quiz });
  } catch (error: any) {
    console.error(error);
    return sendErrorResponse(error);
  }
}

export const handler = middy(lambda).use(jsonBodyParser());

// const quiz = {
//   // TableName: 'Quiztopia',
//   // Item: {
//   PK: { S: 'u#' + tokenOwner.email },
//   SK: { S: 'q#' + quizId },
//   EntityType: { S: 'quiz' },
//   QuizName: { S: quizName },
//   Question: { S: question },
//   Answer: { S: answer },
//   Coordinates: {
//     M: {
//       latitude: { S: coordinates?.latitude },
//       longitude: { S: coordinates?.longitude },
//     },
//   },
//   Id: { S: quizId },
//   CreatedAt: { S: '377' },
//   Creator: { S: tokenOwner.email },
//   // },
// };

// const test = {
//   // TableName: 'Quiztopia',
//   // Item: {
//   PK: { S: 'u#' + 'hora' },
//   SK: { S: 'q#' + 'dd' },
//   EntityType: { S: 'quiz' },
//   QuizName: { S: quizName },
//   Question: { S: question },
//   Answer: { S: answer },
//   Coordinates: {
//     M: {
//       latitude: { S: coordinates?.latitude },
//       longitude: { S: coordinates?.longitude },
//     },
//   },
//   Id: { S: quizId },
//   CreatedAt: { S: '377' },
//   Creator: { S: tokenOwner.email },
//   // },
// };

// async function createQuiz(quiz: any) {
//   const command = new PutItemCommand({
//     TableName: 'Quiztopia',
//     Item: quiz.Item,
//     // Item: {
//     //   PK: { S: 'u#' + quiz.pk },
//     //   SK: { S: 'q#' + quiz.sk },
//     //   EntityType: { S: quiz.entityType },
//     //   QuizName: { S: quiz.quizName },
//     //   Question: { S: quiz.question },
//     //   Answer: { S: quiz.answer },
//     //   Coordinates: {
//     //     M: {
//     //       latitude: { S: quiz.coordinates.latitude },
//     //       longitude: { S: quiz.coordinates.longitude },
//     //     },
//     //   },
//     //   Id: { S: quiz.id },
//     //   Creator: { S: quiz.creator },
//     //   CreatedAt: { S: quiz.createdAt },
//     // },
//   });
//   try {
//     const response = await db.send(command);
//     console.log('response', response);
//   } catch (error) {
//     throw error;
//   }
// }
