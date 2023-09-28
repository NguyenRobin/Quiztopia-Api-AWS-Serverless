import middy from '@middy/core';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { getToken, getTokenOwner } from '../../../jwt';
import {
  sendBodyResponse,
  sendErrorResponse,
  sendResponse,
} from '../../../responses';
import { BatchWriteItemCommand } from '@aws-sdk/client-dynamodb';
import { db } from '../../../services/db';
import { generateDate } from '../../../utils/generateDate';
import { randomUUID } from 'crypto';
import jsonBodyParser from '@middy/http-json-body-parser';

// interface Quiz {
//   pk: string;
//   sk: string;
//   entityType: string;
//   id: string;
//   quizName: string;
//   questions: [
//     {
//       question: string;
//       answer: string;
//       coordinates: { latitude: string; longitude: string };
//     }
//   ];
//   createdAt: string;
//   creator: string;
//   modified?: string;
// }

// async function createQuiz(quiz: Quiz) {
//   const command = new PutItemCommand({
//     TableName: 'Quiztopia',
//     Item: {
//       PK: { S: 'quiz#' + quiz.pk },
//       SK: { S: 'id#' + quiz.sk },
//       EntityType: { S: quiz.entityType },
//       QuizName: { S: quiz.quizName },
//       Questions: {
//         L: quiz.questions.map((question) => ({
//           M: {
//             Question: { S: question.question },
//             Answer: { S: question.answer },
//             Coordinates: {
//               M: {
//                 Latitude: { S: question.coordinates.latitude },
//                 Longitude: { S: question.coordinates.longitude },
//               },
//             },
//           },
//         })),
//       },
//       Id: { S: quiz.id },
//       Creator: { S: quiz.creator },
//       CreatedAt: { S: quiz.createdAt },
//     },
//   });
//   try {
//     const response = await db.send(command);
//     console.log('response', response);
//   } catch (error) {
//     throw error;
//   }
// }

// async function lambda(event: APIGatewayProxyEvent) {
//   try {
//     const { quizName, questions } = event.body as any;

//     const token = getToken(event);
//     const tokenOwner = await getTokenOwner(token!);
//     const quizId = randomUUID();

//     const quiz: Quiz = {
//       pk: quizName,
//       sk: quizId,
//       entityType: 'quiz',
//       quizName,
//       questions,
//       id: quizId,
//       createdAt: generateDate(),
//       creator: tokenOwner.email,
//     };

//     await createQuiz(quiz);

//     return sendBodyResponse(200, { token, tokenOwner, quiz });
//   } catch (error: any) {
//     console.error(error);
//     return sendErrorResponse(error);
//   }
// }

// export const handler = middy(lambda).use(jsonBodyParser());

interface Quiz {
  pk: string;
  sk: string;
  entityType: string;
  id: string;
  quizName: string;
  questions: [
    {
      question: string;
      answer: string;
      coordinates: { latitude: string; longitude: string };
    }
  ];
  createdAt: string;
  creator: string;
  modified?: string;
}
async function createQuiz(quiz: Quiz, madeBy: Quiz) {
  const userQuiz = {
    PK: { S: 'quiz#' + quiz.pk },
    SK: { S: 'id#' + quiz.id },
    EntityType: { S: 'quiz' },
    QuizName: { S: quiz.quizName },
    Questions: {
      L: quiz.questions.map((question) => ({
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
    Id: { S: quiz.id },
    CreatedAt: { S: generateDate() },
    Creator: { S: quiz.creator },
  };

  const type = {
    PK: { S: 'user#' + madeBy.pk },
    SK: { S: 'id#' + madeBy.id },
    EntityType: { S: 'quiz' },
    QuizName: { S: madeBy.quizName },
    Questions: {
      L: madeBy.questions.map((question) => ({
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
    Id: { S: madeBy.id },
    CreatedAt: { S: generateDate() },
    Creator: { S: madeBy.creator },
  };
  const command = new BatchWriteItemCommand({
    RequestItems: {
      Quiztopia: [
        { PutRequest: { Item: userQuiz } },
        { PutRequest: { Item: type } },
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
    const { quizName, questions } = event.body as any;

    const token = getToken(event);
    const tokenOwner = await getTokenOwner(token!);
    const quizId = randomUUID();

    const quizTopic: Quiz = {
      pk: quizName,
      sk: quizId,
      entityType: 'quiz',
      quizName,
      questions,
      id: quizId,
      createdAt: generateDate(),
      creator: tokenOwner.email,
    };

    const quizMadeBy: Quiz = {
      pk: tokenOwner.email,
      sk: quizId,
      entityType: 'quiz',
      quizName,
      questions,
      id: quizId,
      createdAt: generateDate(),
      creator: tokenOwner.email,
    };

    const result = await createQuiz(quizTopic, quizMadeBy);

    return sendResponse(201, 'Quiz successfully created');
  } catch (error: any) {
    console.error(error);
    return sendErrorResponse(error);
  }
}

export const handler = middy(lambda).use(jsonBodyParser());
