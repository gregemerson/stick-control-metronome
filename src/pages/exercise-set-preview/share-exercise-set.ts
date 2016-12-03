import {Component} from '@angular/core';
import {NavParams, NavController} from 'ionic-angular'
import {Validators, FormBuilder, FormGroup, FormControl} from '@angular/forms';

@Component({
  selector: 'share-exercise-set',
  templateUrl: 'share-exercise-set.html',
})
export class ShareExerciseSetForm {
  shareForm: FormGroup;
  private emailCallback: (email: string) => void;

  constructor(private formBuilder: FormBuilder,
    private navCtrl: NavController, params: NavParams) {
      this.emailCallback = <(email: string) => void>params.get('emailCallback');
      this.shareForm = this.formBuilder.group({
        'email': ['', Validators.required]
      });
  }

  create() {
    this.emailCallback(this.shareForm.value.email);
    this.navCtrl.pop();
  }

  cancel() {
    this.navCtrl.pop();
  }
}