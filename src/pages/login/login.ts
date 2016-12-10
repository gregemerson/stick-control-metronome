import {Component, OnChanges, SimpleChanges, isDevMode} from '@angular/core';
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

  // Current accounts
  password = '';
  email = '';

  // For new accounts
  newUserNameCtrl: FormControl;
  newEmailCtrl: FormControl;
  newPassword1Ctrl: FormControl;
  newPassword2Ctrl: FormControl;
  newUserNameError = '';
  newEmailError = '';
  newPassword1Error = '';
  newPassword2Error = '';

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
    this.newUserNameCtrl = new FormControl('', [Validators.required, CustomValidators.userName]);
    this.newEmailCtrl = new FormControl('', [Validators.required, CustomValidators.email]);
    this.newPassword1Ctrl = new FormControl('', [Validators.required, CustomValidators.password]);
    this.newPassword2Ctrl = new FormControl('', [Validators.required, CustomValidators.password]);

    this.accountGroup = this.formBuilder.group({
      newUsername: this.newUserNameCtrl,
      newEmail: this.newEmailCtrl,
      newPassword1: this.newPassword1Ctrl,
      newPassword2: this.newPassword2Ctrl
    });
  }

  errorOn(message: string) {
    this.errorMessage = message;
  }

  errorOff() {
    this.errorMessage = null;
  }

  onChange(form: string) {
    this.errorOff();
  }

  makeVisible(controlGroup: string) {
    for (let ctrl in this.invisibilityMap) {
      this.invisibilityMap[ctrl] = ctrl != controlGroup;
    }
    this.email = '';
    this.password = '';
    this.newEmail = '';
    this.newPassword1 = '';
    this.newPassword2 = '';
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
    this.authenticator.createUser(this.newEmail, 
      this.newPassword1, this.newUsername)
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
