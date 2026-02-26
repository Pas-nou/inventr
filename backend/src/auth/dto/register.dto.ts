import { IsEmail, IsString, MinLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, {
    message: 'Le mot de passe doit contenir au moins 8 caractères.',
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule et un chiffre.',
  })
  password: string;

  @IsString()
  @MinLength(2, {
    message: 'Le prénom doit contenir au moins 2 caractères.',
  })
  first_name: string;

  @IsString()
  @MinLength(2, {
    message: 'Le nom de famille doit contenir au moins 2 caractères.',
  })
  last_name: string;
}
