import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import { NewPasswordInput } from '@/src/modules/auth/password-recovery/inputs/new-password.input';

/**
 * Custom validator to ensure password confirmation matches original password
 */

@ValidatorConstraint({ name: 'IsPasswordsMatching', async: false })
export class IsPasswordsMatchingConstraint
  implements ValidatorConstraintInterface
{
  /**
   * Validates if password repeat matches original password
   * @param passwordRepeat - Password confirmation value
   * @param validationArguments - Contains original object with password
   */
  public validate(
    passwordRepeat: string,
    validationArguments: ValidationArguments,
  ) {
    const object = validationArguments.object as NewPasswordInput;

    return object.password === passwordRepeat;
  }

  /**
   * Error message when passwords don't match
   */
  public defaultMessage() {
    return 'Passwords do not match';
  }
}
