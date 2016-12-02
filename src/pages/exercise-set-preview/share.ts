import {Component} from '@angular/core';
import {NavParams, NavController} from 'ionic-angular'
import {Validators, FormBuilder, FormGroup, FormControl} from '@angular/forms';

@Component({
  selector: 'share',
  templateUrl: 'share.html',
})
export class ShareForm {
  shareForm: FormGroup;
  private callback: (email: string) => void;

  constructor(private formBuilder: FormBuilder,
    private navCtrl: NavController, params: NavParams) {
      this.callback = <(Object) => void>params.get('share');
      this.shareForm = this.formBuilder.group({

      });
  }

  create() {
    this.callback(this.shareForm.value.email);
    this.navCtrl.pop();
  }

  cancel() {
    this.navCtrl.pop();
  }

  private getDefaultValues() {
    return {
      name: '',
      category: '',
      comments: ''
    }
  }
}