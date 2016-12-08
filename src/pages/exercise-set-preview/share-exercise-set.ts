import {Component} from '@angular/core';
import {NavParams, NavController} from 'ionic-angular'
import {Validators, FormBuilder, FormGroup, FormControl} from '@angular/forms';
import {CustomValidators} from '../../utilities/custom-Validators';
import {ExerciseConstraints} from './exercise-constraints';

@Component({
  selector: 'share-exercise-set',
  templateUrl: 'share-exercise-set.html',
})
export class ShareExerciseSetForm {
  shareForm: FormGroup;
  constraints = new ExerciseConstraints();
  private callback: (initializer: Object) => void;

  constructor(private formBuilder: FormBuilder,
    private navCtrl: NavController, params: NavParams) {
      this.callback = <(initializer: Object) => void>params.get('callback');
      this.shareForm = this.formBuilder.group({
        'email': new FormControl('', [
          Validators.required, 
          CustomValidators.email
          ]),
        'comments': new FormControl('', Validators.maxLength(
            this.constraints.maxSharedExerciseComments))
      });
  }

  create() {
    this.callback(this.shareForm.value);
    this.navCtrl.pop();
  }

  cancel() {
    this.navCtrl.pop();
  }
}