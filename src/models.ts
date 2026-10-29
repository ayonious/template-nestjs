import { ApiProperty } from '@nestjs/swagger';

// Swagger needs runtime classes: interfaces disappear when TypeScript is compiled.
// These decorators describe response fields; they do not validate request bodies.
export class User {
  @ApiProperty({ example: '1' })
  id!: string;

  @ApiProperty({ example: 'Alice' })
  name!: string;

  @ApiProperty({ format: 'date-time', example: '2026-01-01T09:00:00.000Z' })
  createdAt!: string;
}

export class Sale {
  @ApiProperty({ example: '101' })
  id!: string;

  @ApiProperty({ example: '1' })
  userId!: string;

  @ApiProperty({ example: 'Notebook' })
  productName!: string;

  @ApiProperty({ example: 12 })
  price!: number;

  @ApiProperty({ format: 'date-time', example: '2026-02-01T10:00:00.000Z' })
  createdAt!: string;
}

// The global exception filter returns this same shape for every failure.
export class ApiError {
  @ApiProperty({ example: 404 })
  statusCode!: number;

  @ApiProperty({ example: 'User not found' })
  message!: string;

  @ApiProperty({ example: '/users/unknown' })
  path!: string;

  @ApiProperty({ format: 'date-time', example: '2026-01-01T00:00:00.000Z' })
  timestamp!: string;
}

export class LoginInput {
  @ApiProperty({ example: '1', minLength: 1, maxLength: 100 })
  userId!: string;

  @ApiProperty({ example: 'Demo-user-1!', format: 'password', minLength: 1, maxLength: 256 })
  password!: string;
}

export class CreateUserInput {
  @ApiProperty({ example: 'Taylor', minLength: 1, maxLength: 100 })
  name!: string;

  @ApiProperty({ example: 'my-demo-password', format: 'password', minLength: 1, maxLength: 256 })
  password!: string;
}
