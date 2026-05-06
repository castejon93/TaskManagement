/** Mirrors UserResponse DTO from the .NET API. */
export interface User {
  id: number;
  name: string;
  email: string;
  /** ISO-8601 timestamp returned by the API. */
  createdAt: string;
}

/** Payload sent to POST /api/users when registering a new user. */
export interface CreateUserRequest {
  name: string;
  email: string;
}
