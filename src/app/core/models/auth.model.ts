export interface TokenPayload {
  sub: number;
  email: string;
  iat: number;
  exp: number;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  gender?: string;
  dob?: string;
  phone?: string;
  occupation?: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}
