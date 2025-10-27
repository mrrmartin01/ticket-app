import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @IsStrongPassword(
    {
      minLength: 5,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
    },
    { message: 'Please provide a stronger password' },
  )
  password: string;
}
