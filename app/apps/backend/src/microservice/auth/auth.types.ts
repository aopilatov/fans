export interface AuthToken {
  sub: string;
  type: 'user' | 'admin' | 'creator' | 'agency';
  creator?: string;
  login?: string;
}
