import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';

@Component({
  selector: 'notation-key',
  templateUrl: 'key.html',
})
export class KeyPage {
  constructor(private navCtrl: NavController) {
  }

  close() {
    this.navCtrl.pop();
  }
}