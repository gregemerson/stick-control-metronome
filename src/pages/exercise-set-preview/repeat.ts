import {Component} from '@angular/core';
import {NavParams, NavController} from 'ionic-angular';

@Component({
  selector: 'new-repeat',
  templateUrl: 'repeat.html',
})
export class RepeatForm {
  minMeasures = 1;
  maxMeasures: number;
  minRepeats = 1;
  maxRepeats = 99;
  numMeasures = 1;
  numRepeats = 1;
  private callback: (measures: number, repeats: number) => void;

  constructor(private navCtrl: NavController, params: NavParams) {
      this.callback = <(measures: number, repeats: number) => void>params.get('create');
      this.maxMeasures = <number>params.get('maxMeasures');
  }

  create() {
    this.callback(this.numMeasures, this.numRepeats);
    this.navCtrl.pop();
  }

  cancel() {
    this.navCtrl.pop();
  }
}