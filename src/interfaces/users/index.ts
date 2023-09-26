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
