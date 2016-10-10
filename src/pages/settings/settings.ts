import { Component, Input } from '@angular/core';
import { NavController, ModalController, PopoverController, LoadingController, Loading } from 'ionic-angular';
import {UserSettings} from '../../providers/user-settings/user-settings';
import {ExerciseSets, IExerciseSet, IExercise} from '../../providers/exercise-sets/exercise-sets';
import {ExerciseSetPreviewPage} from '../exercise-set-preview/exercise-set-preview';
import {MessagesPage, IMessage, MessageType} from '../messages/messages';

@Component({
  selector: 'settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {
  selectedExerciseSetName: string;

  constructor(private nav: NavController, 
    public userSettings: UserSettings, 
    public exerciseSets: ExerciseSets,
    public modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    private popoverCtrl: PopoverController) {
  }

  ngAfterViewInit() {
    let set = this.exerciseSets.currentExerciseSet;
    this.selectedExerciseSetName = (set == null) ? null 
      : set.name;
  }

  onChange($event) {
    let loading = this.loadingCtrl.create();
    loading.present();
    this.exerciseSets.setCurrentExerciseSet($event).subscribe(
      () => {
        loading.dismiss();
      },
      (error: any) => {
        loading.dismiss();
        this.popoverCtrl.create(MessagesPage, {
          messages: [MessagesPage.createMessage('Error', error, MessageType.Error)]
        }).present();
      }
    )
      // @todo Add real error messaging
  }

  createClicked($event) {

  }

  openClicked($event) {
    let modal = this.modalCtrl.create(
      ExerciseSetPreviewPage, {
        exerciseSets: this.exerciseSets
      });
    modal.present();
  }
}