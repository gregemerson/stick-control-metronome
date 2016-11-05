import {Component} from '@angular/core';
import {NavParams, NavController} from 'ionic-angular'
import {Validators, FormBuilder, FormGroup, FormControl} from '@angular/forms';
import {ExerciseConstraints} from './exercise-constraints';

@Component({
  selector: 'new-exercise',
  templateUrl: 'new-exercise.html',
})
export class NewExerciseForm {
  newExercise: FormGroup;
  constraints = new ExerciseConstraints();
  private callback: (Object) => void;

  constructor(private formBuilder: FormBuilder,
    private navCtrl: NavController, params: NavParams) {
      this.callback = <(Object) => void>params.get('create');
      this.newExercise = this.formBuilder.group({
        name: ['', Validators.maxLength(this.constraints.maxNameLength)],
        category: ['', Validators.maxLength(this.constraints.maxCategoryLength)],
        comments: ['', Validators.maxLength(this.constraints.maxExerciseCommentsLength)],
      });
  }

  ionViewLoaded() {

  }

  create() {
    this.callback(this.newExercise.value);
    this.navCtrl.pop();
  }

  cancel() {
    this.navCtrl.pop();
  }
}