import {FormControl, AbstractControl, ValidatorFn} from '@angular/forms';

export class CustomValidators {

  readonly minUserNameLength = 5;
  readonly maxUserNameLength = 20;
  readonly maxEmailLength = 254;
  readonly minPasswordLength = 8;
  readonly maxPasswordLength = 12;

  static email(ctrl: AbstractControl): Object {
    if (ctrl.value.length > 254) {
      return {error: 'Email address too long'}
    }
    const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return regex.test(ctrl.value) ? null : {error: 'Invalid email address'};
  }

  static userName(ctrl: AbstractControl): Object {
    const regex = /^[a-z0-9]+$/i;
    let lengthError = CustomValidators.minMaxLengths('User name', ctrl.value, 5, 20);
    if (lengthError) {
      return lengthError;
    }
    if (!regex.test(ctrl.value)) {
      return {error: 'User name can only contain numerals and letters'};
    }
    return null;
  }

  static password(ctrl: AbstractControl): Object {
    const regex = /^[a-z0-9!@#$%^&*]+$/i;
    let lengthError = CustomValidators.minMaxLengths('User name', ctrl.value, 8, 12);
    if (lengthError) {
      return lengthError;
    }
    if (!regex.test(ctrl.value)) {
      return {error: 'User name can only contain numerals, letters, !, @, #, $, %, ^, & or *'};
    }
    return null;
  }

  static minMaxLengths(what: string, value: string, min: number, max: number): Object {
    if (value.length < min || value.length > max) {
      return {error: what + ' must contain between ' +
         min + ' and ' + max + ' characters'};
    }
    return null;
  }
}