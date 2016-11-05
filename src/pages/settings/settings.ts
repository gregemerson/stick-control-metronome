import {Component, Input } from '@angular/core';
import {NavController, ModalController, PopoverController, LoadingController, Loading} from 'ionic-angular';
import {Authenticator, IAuthUserSettings} from '../../providers/authenticator/authenticator';
import {ExerciseSetPreviewPage} from '../exercise-set-preview/exercise-set-preview';
import {MessagesPage, IMessage, MessageType} from '../messages/messages';

@Component({
  selector: 'settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {
  settings: IAuthUserSettings;

  constructor(private nav: NavController, 
    private authenticator: Authenticator) {
    this.settings = authenticator.user.settings;
  }

  saveClicked($event) {

  }
}