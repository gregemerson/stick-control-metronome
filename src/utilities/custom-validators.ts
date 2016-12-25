import {FormControl, AbstractControl, ValidatorFn} from '@angular/forms';

export class CustomValidators {

  readonly minUserNameLength = 5;
  readonly maxUserNameLength = 20;
  readonly maxEmailLength = 254;
  readonly minPasswordLength = 8;
  readonly maxPasswordLength = 12;

  static email(ctrl: AbstractControl): Object {
    let validation = null;
    const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    let emptyHandled = {};
    /*
    if (CustomValidators.checkForEmptyVaue(ctrl, emptyHandled)) {
      validation = emptyHandled['validation'];
    }
    */
    if (ctrl.value.length == 0) {
      return null;
    }
    else if (ctrl.value.length > 254) {
      validation = {emailError: 'Email address too long'}
    }
    else {
      validation = regex.test(ctrl.value) ? null : {emailError: 'Invalid email address'};
    }
    // console.log(validation);
    return validation;
  }

  static userName(ctrl: AbstractControl): Object {
    let emptyHandled = {};
    if (CustomValidators.checkForEmptyVaue(ctrl, emptyHandled)) {
      return emptyHandled['validation'];
    }
    if (ctrl.value == null) {
      return {error: 'User name not set'};
    }
    if (ctrl.value.length == 0) {
      return null;
    }
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
    let emptyHandled = {};
    if (CustomValidators.checkForEmptyVaue(ctrl, emptyHandled)) {
      return emptyHandled['validation'];
    }
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

  private static checkForEmptyVaue(ctrl: AbstractControl, emptyHandled: Object): boolean {
    if (!ctrl.value) {
      emptyHandled['validation'] = {error: 'Value not set'};
    }
    else if (ctrl.value.length == 0) {
      emptyHandled['validation'] = null;
    }
    return emptyHandled.hasOwnProperty('validation');
  }

  static minMaxLengths(what: string, value: string, min: number, max: number): Object {
    if (value.length < min || value.length > max) {
      return {error: what + ' must contain between ' +
         min + ' and ' + max + ' characters'};
    }
    return null;
  }
}