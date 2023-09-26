import { AttributeValue } from '@aws-sdk/client-dynamodb';

export interface SignupRequest {
  email: string;
  password: string;
}

export interface SignupUser {
  pk: string;
  sk: string;
  entityType: string;
  email: string;
  password: string;
  createdAt: string;
  modifiedAt?: string;
}

export interface UserCredentials {
  email: string;
  password: string;
}
