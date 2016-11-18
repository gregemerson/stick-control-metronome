import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';

@Component({
  selector: 'warning',
  templateUrl: 'warning.html',
})
export class WarningPage {
  message: string;
  okCallback: () => void;
  constructor(private navCtrl: NavController, private params: NavParams) {
    this.message = params.get('message');
    this.okCallback = params.get('okCallback');
  }

  onOk() {
    this.okCallback();
  }

  onCancel() {
    this.navCtrl.pop();
  }
}