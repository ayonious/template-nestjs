import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy as Strategy } from 'passport-http';
import { CredentialsService } from './credentials.service.js';

// Passport parses the Basic Authorization header; Nest supplies the dependencies.
// The strategy name "basic" connects this provider to AuthGuard('basic').
@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy, 'basic') {
  constructor(private readonly credentials: CredentialsService) {
    super();
  }

  validate(userId: string, password: string) {
    if (userId.length > 100 || password.length > 256) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.credentials.validate(userId, password);
  }
}
