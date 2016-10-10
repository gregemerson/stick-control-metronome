import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';

@Component({
  selector: 'messages',
  templateUrl: 'messages.html',
})
export class MessagesPage {
  messages: Array<IMessage> = [];
  constructor(private navCtrl: NavController, private params: NavParams) {
    this.messages = params.get('messages');
  }

  static createMessage(heading: string, body: string, type: MessageType): IMessage {
    return new Message(heading, body, type);
  }
}

export enum MessageType {
  None,
  Error,
  Info
}

export interface IMessage {
  type: MessageType,
  heading: string,
  body: string,
}

class Message implements IMessage {
  constructor(public heading: string, public body: 
    string, public type: MessageType) {
  }
}
