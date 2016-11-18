import {Component} from '@angular/core';
import {NavParams, NavController} from 'ionic-angular'
import {Validators, FormBuilder, FormGroup, FormControl} from '@angular/forms';
import {ExerciseConstraints} from './exercise-constraints';

@Component({
  selector: 'new-exercise-set',
  templateUrl: 'new-exercise-set.html',
})
export class NewExerciseSetForm {
  newExerciseSet: FormGroup;
  constraints = new ExerciseConstraints();
  private callback: (Object) => void;

  constructor(private formBuilder: FormBuilder,
    private navCtrl: NavController, params: NavParams) {
      this.callback = <(Object) => void>params.get('create');
      this.newExerciseSet = this.formBuilder.group({
        name: ['', Validators.maxLength(this.constraints.maxNameLength)],
        category: ['', Validators.maxLength(this.constraints.maxCategoryLength)],
        comments: ['', Validators.maxLength(this.constraints.maxExerciseSetCommentsLength)],
      });
  }

  ionViewLoaded() {

  }

  create() {
    this.callback(this.newExerciseSet.value);
    this.navCtrl.pop();
  }

  cancel() {
    this.navCtrl.pop();
  }
}