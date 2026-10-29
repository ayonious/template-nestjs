import { Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { DataService } from './data.service.js';

// Nest shares this small in-memory password database between creation and login.
// Plain-text passwords deliberately keep this example easy to inspect; demo use only.
@Injectable()
export class CredentialsService implements OnModuleInit {
  private readonly passwords: { userId: string; password: string }[] = [];

  constructor(private readonly data: DataService) {}

  // Nest runs this hook before serving requests, giving every fixture user a password.
  onModuleInit() {
    for (const user of this.data.getUsers()) {
      this.passwords.push({ userId: user.id, password: `Demo-user-${user.id}!` });
    }
  }

  createUser(name: string, password: string) {
    const user = this.data.createUser(name);
    this.passwords.push({ userId: user.id, password });
    return user;
  }

  validate(userId: string, password: string) {
    const credentials = this.passwords.find((record) => record.userId === userId);
    const user = this.data.getUser(userId);
    if (!credentials || credentials.password !== password || !user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // Return only the public user. The password database is never serialized by a route.
    return user;
  }
}
