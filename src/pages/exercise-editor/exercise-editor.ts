import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {IExercise} from '../../providers/exercise-sets/exercise-sets';
import {ExerciseDisplay} from '../exercise-display/exercise-display';

@Component({
  selector: 'exercise-editor',
  templateUrl: 'exercise-editor.html',
})
export class ExerciseSetEditorPage {
  @ViewChild(ExerciseDisplay) display: ExerciseDisplay;
  @ViewChild('displayContainer') container: ElementRef;
  private exercise: IExercise;

  constructor(private navCtrl: NavController, private params: NavParams) {
      this.exercise = <IExercise>params.get('exercise');
  }

  enterClicked(type: string) {

  }

  ngAfterViewInit() {
    let width = Number.parseInt(this.container.nativeElement.clientWidth);
    let fontSize = Number.parseInt(getComputedStyle(this.container.nativeElement).fontSize);
    this.display.draw(this.exercise, width, Number.MAX_SAFE_INTEGER, fontSize);     
  }
}
