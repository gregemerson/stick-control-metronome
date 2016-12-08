import {FormControl, AbstractControl, ValidatorFn} from '@angular/forms';

export class CustomValidators {

  static email(ctrl: AbstractControl): Object {
    if (ctrl.value.length > 254) {
      return {message: 'Email address too long'}
    }
    const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return regex.test(ctrl.value) ? null : {message: 'Invalid email address'};
  }
}