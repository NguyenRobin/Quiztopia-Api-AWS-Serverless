import { APIGatewayProxyEvent } from 'aws-lambda';

const jwt = require('jsonwebtoken');

export function createToken(email: string) {
  const token: string = jwt.sign(
    { email: email },
    `${process.env.SECRET_KEY}`,
    {
      expiresIn: '1h',
    }
  );
  return token;
}

export function getToken(event: APIGatewayProxyEvent) {
  const token = event?.headers?.authorization?.replace('Bearer ', '').trim();
  return token;
}

export async function getTokenOwner(token: string) {
  const tokenOwner = await jwt.verify(token, `${process.env.SECRET_KEY}`);
  return tokenOwner;
}
