import {Component} from '@angular/core';
import {NavController, NavParams, ModalController, Modal} from 'ionic-angular';

@Component({
  selector: 'messages',
  templateUrl: 'messages.html',
})
export class MessagesPage {
  messages: Array<IMessage> = [];
  constructor(private navCtrl: NavController, 
    private params: NavParams, private modalCrl: ModalController) {
    this.messages = params.get('messages');
  }

  static createMessage(heading: string, body: string, type: MessageType): IMessage {
    return new Message(heading, body, type.toString());
  }

  onOk() {
    this.navCtrl.pop();
  }
}

export enum MessageType {
  Error,
  Info
}

export interface IMessage {
  type: string,
  heading: string,
  body: string,
}

class Message implements IMessage {
  constructor(public heading: string, public body: 
    string, public type: string) {
  }
}
