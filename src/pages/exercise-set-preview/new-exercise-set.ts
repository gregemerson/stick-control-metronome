import {Component} from '@angular/core';
import {NavParams, NavController} from 'ionic-angular'
import {Validators, FormBuilder, FormGroup, FormControl} from '@angular/forms';

@Component({
  selector: 'new-exercise-set',
  templateUrl: 'new-exercise-set.html',
})
export class NewExerciseSetForm {
  newExerciseSet: FormGroup;
  maxNameChars = 40;
  maxCategoryChars = 20;
  maxCommentsChars = 200;
  private callback: (Object) => void;

  constructor(private formBuilder: FormBuilder,
    private navCtrl: NavController, params: NavParams) {
      this.callback = <(Object) => void>params.get('create');
      this.newExerciseSet = this.formBuilder.group({
        name: ['', Validators.maxLength(this.maxNameChars)],
        category: ['', Validators.maxLength(this.maxCategoryChars)],
        comments: ['', Validators.maxLength(this.maxCommentsChars)],
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