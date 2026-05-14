export interface JwtPayload {
  username: string;
  sub: string;
  isAdmin: boolean;
  iat?: number;
  exp?: number;
}
