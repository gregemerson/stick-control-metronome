import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'messages',
  templateUrl: 'messages.html',
})
export class MessagesPage {
  messages: Array<string> = [];
  category: string = '';
  constructor(private navCtrl: NavController) {

  }

  addMessage(message: string) {
    this.messages.push(message);
  }
}
