import { APIGatewayProxyEvent } from 'aws-lambda';
interface SignupRequest {
  email: string;
  password: string;
}
export const handler = async function name(event: APIGatewayProxyEvent) {
  console.log(event);
  return {
    statusCode: 200,
    body: JSON.stringify({ event }),
  };
};
