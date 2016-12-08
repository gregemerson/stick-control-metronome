import {Component, OnChanges, SimpleChanges} from '@angular/core';
import {NavController, NavParams, ViewController} from 'ionic-angular';
import {Authenticator, IAuthUser} from '../../providers/authenticator/authenticator';
import {Observer} from "rxjs";

@Component({
  selector: 'login',
  templateUrl: 'login.html'
})
export class LoginPage {
  private maxPasswordLength = 12;
  private maxUsernameLength = 20;
  
  // Current accounts
  password = '';
  email = '';

  // For new accounts
  newUsername = '';
  newEmail = '';
  newPassword1 = '';
  newPassword2 = '';

  showError = false;

  private authenticator: Authenticator;
  
  // Usedf to switch between different control groups
  invisibilityMap = {
      'Menu': false,
      'LogIn': true,
      'CreateAccount': true
  };

  constructor(private navCtrl: NavController,
              private navParams: NavParams,
              private viewCtrl: ViewController) {
    this.authenticator = <Authenticator>navParams.get('authenticator');
  }

  onChange(form: string) {
    this.showError = false;
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
    this.showError = false;
  }

  logIn() {
    this.authenticator.login(this.email, this.password)
    .subscribe(
      () => {
        this.viewCtrl.dismiss();
      }, 
      (err: any) => {
        this.showError = true;
        console.log(err);
        // Display errors
      }, 
        () => {
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
        console.log(err);
        // Display errors
      }, 
        () => {
      }
    );
  }

  loginGuest() {
    this.authenticator.loginGuest().subscribe(
      next => {
        this.viewCtrl.dismiss();
      }, 
      err => {
        console.log(err);
      }, 
      () => {
      });
  }
}
