import { Component, ViewChildren, ViewChild, ElementRef, QueryList } from '@angular/core';
import { NavController, ModalController} from 'ionic-angular';
import {ExerciseSets, IExerciseSet, IExercise} from '../../providers/exercise-sets/exercise-sets';
import {ExerciseDisplay} from '../exercise-display/exercise-display';

@Component({
  selector: 'exercise-set-preview',
  templateUrl: 'exercise-set-preview.html',
})
export class ExerciseSetPreviewPage {
  title = '';
  exerciseSet: IExerciseSet;
  exercises: Array<IExercise> = [];
  modal: ModalController;
  @ViewChildren(ExerciseDisplay) displays: QueryList<ExerciseDisplay>;
  @ViewChildren('displayContainer') contents: QueryList<ElementRef>;

  constructor(private navCtrl: NavController, private exerciseSets: ExerciseSets) {
  }

  newClicked($event) {
    this.exerciseSets.newExerciseSet(true).subscribe({
      next: () => {},
      error: (err: any) => {
        // @todo error message
      }
    })
  }

  closeClicked($event) {
    this.navCtrl.pop();
  }

  ngAfterViewInit() {
    this.loadExercises();
    let containers = this.contents.toArray();
    let displays = this.displays.toArray();
    for (let i = 0; i < displays.length; i++) {
      let width = Number.parseInt(containers[i].nativeElement.clientWidth);
      let exercise = this.exercises[i];
      let fontSize = 1.5 * Number.parseInt(getComputedStyle(containers[i].nativeElement).fontSize);
      displays[i].draw(exercise, width, Number.MAX_SAFE_INTEGER, fontSize);
      // Need to set the card height here

    }
  }

  private loadExercises() {
    if (this.exerciseSets.currentExerciseSet == null) {
      return;
    }
    let exerciseSet = this.exerciseSets.currentExerciseSet;
    exerciseSet.initIterator();
    while (exerciseSet.next() != null) {
      this.exercises.push(this.exerciseSet.currentExercise);
    }
  }
}
