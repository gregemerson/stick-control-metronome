import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';

@Component({
  selector: 'about',
  templateUrl: 'about.html'
})
export class AboutPage {
  constructor(private navCtrl: NavController) {
  }
}
