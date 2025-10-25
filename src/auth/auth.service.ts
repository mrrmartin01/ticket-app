import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  signIn(userName: string, password: string) {
    return { userName, password };
  }
}
