export interface RefreshJwtPayload {
  sub: string;
  type: 'refresh';
  deviceId?: string;
  iat: number;
  exp?: number;
}
