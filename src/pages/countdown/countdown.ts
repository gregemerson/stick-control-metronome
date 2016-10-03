import { Component, EventEmitter, ChangeDetectorRef} from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';

@Component({
  selector: 'countdown',
  templateUrl: 'countdown.html'
})
export class CountDownPage{
  countdown: number;
  id: number = Math.random();
  countEmitter: EventEmitter<number>;
  subscription: any;
  constructor(private nav: NavController, 
              private navParams: NavParams,
              private viewController: ViewController,
              private changeDetect: ChangeDetectorRef) {
      this.countEmitter = <EventEmitter<number>>navParams.get('countdown');
      this.subscription = this.countEmitter.subscribe(
        count => this.countHandler(count));
      
  }

  countHandler(count: number) {
    if (count ==  1) {
      this.subscription.unsubscribe();
      this.nav.pop();
      //this.nav.pop();
      return;
    }
    this.countdown = count;
    this.changeDetect.detectChanges();
  }
}
