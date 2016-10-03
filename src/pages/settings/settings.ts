import { Component, Input } from '@angular/core';
import { NavController, ModalController, LoadingController, Loading } from 'ionic-angular';
import {UserSettings} from '../../providers/user-settings/user-settings';
import {ExerciseSets, IExerciseSet, IExercise} from '../../providers/exercise-sets/exercise-sets';
import {ExerciseSetPreviewPage} from '../../pages/exercise-set-preview/exercise-set-preview';

@Component({
  selector: 'settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {
  loading: Loading;

  constructor(private nav: NavController, 
    public userSettings: UserSettings, 
    public exerciseSets: ExerciseSets,
    public modalCtrl: ModalController,
    private loadingCtrl: LoadingController) {
  }

  onChange($event) {
    this.loading = this.loadingCtrl.create();
    this.loading.present()
      .then(fulfilled => this.exerciseSets.setCurrentExerciseSet($event))
      .then(fulfilled => this.loading.dismiss())
      .catch(rejected => this.loading.dismiss());
      // @todo Add error messaging
  }

  previewClicked($event) {
    let modal = this.modalCtrl.create(
      ExerciseSetPreviewPage, {
        exerciseSet: this.exerciseSets.currentExerciseSet
      });
    modal.present();
  }
}
