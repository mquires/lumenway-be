import { NewPasswordInput } from '@/src/modules/auth/password-recovery/inputs/new-password.input';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsPasswordsMatching', async: false })
export class IsPasswordsMatchingConstraint
  implements ValidatorConstraintInterface
{
  public validate(
    passwordRepeat: string,
    validationArguments: ValidationArguments,
  ) {
    const object = validationArguments.object as NewPasswordInput;

    return object.password === passwordRepeat;
  }

  public defaultMessage() {
    return 'Passwords do not match';
  }
}
