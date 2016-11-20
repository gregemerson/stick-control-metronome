import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {Authenticator} from '../../providers/authenticator/authenticator'
import {HomePage} from '../home/home'

@Component({
  selector: 'app-buttons',
  templateUrl: 'app-buttons.html'
})
export class AppButtons {

  constructor(public navCtrl: NavController, 
    private authenticator: Authenticator) {}

  logout() {
    this.authenticator.logout().subscribe({
      next: (res: Object) => {
        this.navCtrl.push(HomePage);
      },
      error: (err: any) => {
        console.dir(err);
      }
    });
  }
}
