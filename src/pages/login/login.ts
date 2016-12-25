import {Component, OnChanges, isDevMode} from '@angular/core';
import {NavController, NavParams, ViewController} from 'ionic-angular';
import {Authenticator, IAuthUser} from '../../providers/authenticator/authenticator';
import {Validators, FormBuilder, FormGroup, FormControl} from '@angular/forms';
import {CustomValidators} from '../../utilities/custom-validators';
import {Observer} from "rxjs";

@Component({
  selector: 'login',
  templateUrl: 'login.html'
})
export class LoginPage {
  errorMessage: string = null;
  constraints = new CustomValidators();

  accountGroup: FormGroup;

  errorFontEm = .8;

  // Current accounts
  password = '';
  email = '';

  // For new accounts
  newUsernameCtrl: FormControl;
  newEmailCtrl: FormControl;
  newPassword1Ctrl: FormControl;
  newPassword2Ctrl: FormControl;
  newUserNameError = '';
  newEmailError = '';
  newPassword1Error = '';
  newPassword2Error = '';
  passwordMismatch = false;

  private authenticator: Authenticator;
  
  // Usedf to switch between different control groups
  invisibilityMap = {
      'Menu': false,
      'LogIn': true,
      'CreateAccount': true
  };

  constructor(private navCtrl: NavController,
              private navParams: NavParams,
              private viewCtrl: ViewController,
              private formBuilder: FormBuilder) {
    this.authenticator = <Authenticator>navParams.get('authenticator');
    this.newUsernameCtrl = new FormControl('', [Validators.required, CustomValidators.userName]);
    this.newEmailCtrl = new FormControl('', [Validators.required, CustomValidators.email]);
    this.newPassword1Ctrl = new FormControl('', [Validators.required, CustomValidators.password]);
    this.newPassword2Ctrl = new FormControl('', [Validators.required, CustomValidators.password]);

    this.accountGroup = this.formBuilder.group({
      newUsername: this.newUsernameCtrl,
      newEmail: this.newEmailCtrl,
      newPassword1: this.newPassword1Ctrl,
      newPassword2: this.newPassword2Ctrl
    });
  }

  

  onEmailChange() {
    console.dir(this.newEmailCtrl.errors);
  }

  errorOn(message: string) {
    this.errorMessage = message;
  }

  errorOff() {
    this.errorMessage = null;
  }

  onPasswordChange() {
    let p1 = this.newPassword1Ctrl.value;
    let p2 = this.newPassword2Ctrl.value;
    this.passwordMismatch = (p1 && p2 && p1 != p2);
  }

  makeVisible(controlGroup: string) {
    for (let ctrl in this.invisibilityMap) {
      this.invisibilityMap[ctrl] = ctrl != controlGroup;
    }
    // Login
    this.email = '';
    this.password = '';
    // New account
    this.newUsernameCtrl.setValue('');
    this.newEmailCtrl.setValue('');
    this.newPassword1Ctrl.setValue('');
    this.newPassword2Ctrl.setValue('');
    this.errorOff();
  }

  logIn() {
    this.authenticator.login(this.email, this.password)
    .subscribe(
      () => {
        this.viewCtrl.dismiss();
      }, 
      (err: any) => {
        if (isDevMode()) {
          console.dir(err);
        }
        this.errorOn('Invalid credentials');
      }
    );
  }

  createAccount() {
    if (!this.accountGroup.valid) {
      return;
    }
    this.authenticator.createUser(this.newEmailCtrl.value, 
      this.newPassword1Ctrl.value, this.newUsernameCtrl.value)
      .subscribe(
      () => {
        this.makeVisible('LogIn');
      }, 
      (err: any) => {
        if (isDevMode()) {
          console.dir(err);
        }
        this.errorOn('Could not create account');
      }
    );
  }

  loginGuest() {
    this.authenticator.loginGuest().subscribe(
      next => {
        this.viewCtrl.dismiss();
      }, 
      err => {
        if (isDevMode()) {
          console.log(err);
        }
        this.errorOn('Could not log in as guest')
      }
    );
  }
}
