import authApiService from '../api/authService';
import { LoginRequest, SignupRequest, ApiAuthResponse } from '../api/types';

export type { LoginRequest as LoginPayload, SignupRequest as SignupPayload };
export type { ApiAuthResponse as AuthResponse };

const AuthService = {
  login: (payload: LoginRequest): Promise<ApiAuthResponse> =>
    authApiService.login(payload),

  signup: (payload: SignupRequest): Promise<ApiAuthResponse> =>
    authApiService.signup(payload),

  logout: (): Promise<void> =>
    authApiService.logout(),
};

export default AuthService;
