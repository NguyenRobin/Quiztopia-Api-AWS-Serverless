import middy from '@middy/core';
import { APIGatewayProxyEvent } from 'aws-lambda';

async function lambda(event: APIGatewayProxyEvent) {
  console.log(event);
  try {
  } catch (error: any) {}
}

export const handler = middy(lambda);
