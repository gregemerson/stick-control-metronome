import { SimpleChanges, Component, ViewChildren, ViewChild, ElementRef, QueryList } from '@angular/core';
import { NavController, ModalController, NavParams, LoadingController, Loading, PopoverController} from 'ionic-angular';
import {ExerciseSets, IExerciseSet, IExercise} from '../../providers/exercise-sets/exercise-sets';
import {ExerciseDisplay} from '../exercise-display/exercise-display';
import {MessagesPage, MessageType, IMessage} from '../messages/messages';
import {NewExerciseSetForm} from './new-exercise-set';

@Component({
  selector: 'exercise-set-preview',
  templateUrl: 'exercise-set-preview.html',
})
export class ExerciseSetPreviewPage {
  title = '';
  exercises: Array<IExercise> = [];
  modal: ModalController;
  selectedExerciseSetId: number;
  @ViewChildren(ExerciseDisplay) displays: QueryList<ExerciseDisplay>;
  @ViewChildren('displayContainer') contents: QueryList<ElementRef>;

  constructor(private navCtrl: NavController, 
    public exerciseSets: ExerciseSets, 
    private params: NavParams,
    private loadingCtrl: LoadingController,
    private popoverCtrl: PopoverController) {
    //this.exerciseSets = <ExerciseSets>params.get('exerciseSets');
    // this.loadExercises();
  }

  newExerciseSet($event) {
    this.popoverCtrl.create(NewExerciseSetForm, {
      create: (formData: Object) => {
          if (!formData) {
            return;
          }
          this.exerciseSets.newExerciseSet(formData).subscribe({
            next: (setId: number) => {
              this.onChange(setId);
            },
            error: (err: any) => {
              this.showMessages([MessagesPage.createMessage(
                'Error', 'Could not create exercise set.', MessageType.Error
              )]);
            }
          });
      }
    }).present();
  }

  onChange($event) {
    if (!$event) {
      return;
    }
    let loading = this.loadingCtrl.create();
    loading.present();
    this.exerciseSets.setCurrentExerciseSet($event).subscribe(
      () => {
        loading.dismiss();
        this.selectedExerciseSetId = 
          this.exerciseSets.currentExerciseSet.id;
        this.loadExercises();
      },
      (error: any) => {
        loading.dismiss();
        this.popoverCtrl.create(MessagesPage, {
          messages: [MessagesPage.createMessage('Error', error, MessageType.Error)]
        }).present();
      }
    )
  }

  ngAfterViewInit() {
    this.contents.changes.subscribe((changes: any) => this.displayExercises());
    this.selectedExerciseSetId = 
      this.exerciseSets.currentExerciseSet ? 
      this.exerciseSets.currentExerciseSet.id : null;
    this.loadExercises();
  }

  private loadExercises() {
    if (!this.exerciseSets.currentExerciseSet) {
      return;
    }
    this.exercises.length = 0;
    let exerciseSet = this.exerciseSets.currentExerciseSet;
    exerciseSet.initIterator();
    while (exerciseSet.next() != null) {
      this.exercises.push(exerciseSet.currentExercise);
    }
  }

  private displayExercises() {
    let containers = this.contents.toArray();
    let displays = this.displays.toArray();
    for (let i = 0; i < displays.length; i++) {
      let exercise = this.exercises[i];
      let fontSize = 1.5 * Number.parseInt(getComputedStyle(containers[i].nativeElement).fontSize);
      displays[i].draw(exercise, containers[i], Number.MAX_SAFE_INTEGER, fontSize);
    }
  }

  private showMessages(messages: Array<IMessage>) {
    this.popoverCtrl.create(MessagesPage, {
      messages: messages
    }).present();
  }
}
