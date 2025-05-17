import { User } from './user.model';

export interface TokenResponse {
  token: string;
  refreshToken: string;
  expiresAt: Date;
}

export interface AuthResponse {
  user: User;
  tokens: TokenResponse;
  errorList?: string[];
} 