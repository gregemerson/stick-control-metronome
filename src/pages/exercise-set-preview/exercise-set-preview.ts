import { SimpleChanges, Component, ViewChildren, ViewChild, ElementRef, QueryList } from '@angular/core';
import { NavController, ModalController, NavParams, LoadingController, Loading, PopoverController} from 'ionic-angular';
import * as ES from '../../providers/exercise-sets/exercise-sets';
import {ExerciseDisplay} from '../exercise-display/exercise-display';
import {MessagesPage, MessageType, IMessage} from '../messages/messages';
import {NewExerciseSetForm} from './new-exercise-set';
import {NewExerciseForm} from './new-exercise';

@Component({
  selector: 'exercise-set-preview',
  templateUrl: 'exercise-set-preview.html',
})
export class ExerciseSetPreviewPage {
  title = '';
  exercises: Array<ES.IExercise> = [];
  selectedExerciseSetId: number = null;
  exerciseEditor: ExerciseEditor;
  editIndex: number = -1
  @ViewChildren(ExerciseDisplay) displays: QueryList<ExerciseDisplay>;
  @ViewChildren('displayContainer') contents: QueryList<ElementRef>;
  private fontFactor = 1.5;

  constructor(private navCtrl: NavController, 
    public exerciseSets: ES.ExerciseSets,
    private params: NavParams,
    private loadingCtrl: LoadingController,
    private popoverCtrl: PopoverController,
    private modal: ModalController) {
    //this.ES.ExerciseSets = <ES.ExerciseSets>params.get('ES.ExerciseSets');
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

  newExercise($event) {
    this.popoverCtrl.create(NewExerciseForm, {
      create: (formData: Object) => {
          let exerciseSet = this.exerciseSets.currentExerciseSet;
          if (!formData) {
            return;
          }
          exerciseSet.newExercise(formData).subscribe({
            next: (exerciseId: number) => {
              let index = 0;
              let exercise = null;
              exerciseSet.initIterator();
              while (exerciseSet.next() != null) {
                if (exerciseSet.currentExercise.id == exerciseId) {
                  exercise = exerciseSet.currentExercise;
                  break;
                }
                index++;
              }  
              this.exercises.splice(index, 0, exercise);
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
      this.selectedExerciseSetId = null;
      return;
    }
    let loading = this.showLoading();
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

  private displayExercises(index = -1) {
    let containers = this.contents.toArray();
    let displays = this.displays.toArray();
    let exercises = this.exercises;
    if (index == -1) {
      for (let i = 0; i < displays.length; i++) {
        this.drawExercise(exercises[i], displays[i], containers[i]);
      }
    }
    else {
      this.drawExercise(exercises[index], displays[index], containers[index]);
    }
  }

  private drawExercise(exercise: ES.IExercise, 
    display: ExerciseDisplay, container: ElementRef) {
      let fontSize = this.fontFactor * Number.parseInt(
        getComputedStyle(container.nativeElement).fontSize);
      display.draw(exercise, container, 
        Number.MAX_SAFE_INTEGER, fontSize);
    }

  private showMessages(messages: Array<IMessage>) {
    this.popoverCtrl.create(MessagesPage, {
      messages: messages
    }).present();
  }

  private showLoading(): Loading {
    let loading = this.loadingCtrl.create();
    loading.present();
    return loading;
  }

  editExercise(idx: number) {
    this.editIndex = idx;
    let display = <ExerciseDisplay>this.displays[idx];
    display.showCursor = true;
    let container = this.contents[idx];
    let exercise = this.exercises[idx];
    this.exerciseEditor = new 
      ExerciseEditor(exercise.display, () => {
        this.drawExercise(exercise, display, container);
      }, (position: number) => {
        display.drawCursor(position);
      });
  }

  deleteExercise(idx: number) {

  }

  saveExerciseEditing(index: number) {

  }

  cancelExerciseEditing(index: number) {
    this.editIndex = -1;
    this.exerciseEditor = null;
  }
}

export class ExerciseEditor {
  originalNotation: string;
  accent = 'accent';
  grace = 'grace';
  rightHand = ES.Encoding.right;
  leftHand = ES.Encoding.left;
  bothHands = ES.Encoding.both;
  noHands = ES.Encoding.rest;
  
  constructor(private elements: ES.ExerciseElements,
    private drawExercise: () => void,
    private drawCursor: (position: number) => void) {
    this.originalNotation = elements.encoded;
    elements.resetCursor();
  }

  private drawAll() {
    this.drawExercise();
    this.drawCursor(this.elements.cursorPosition);
  }

  backspace() {
    this.elements.deleteAtCursor();
    if (this.elements.elementAtCursorIs(ES.Repeat)) {
      this.elements.deleteAtCursor();
    }
    this.drawAll();
  }

  forward() {
    this.elements.cursorForward();
    this.drawCursor(this.elements.cursorPosition);
  }

  back() {
    this.elements.cursorBack();
    this.drawCursor(this.elements.cursorPosition);
  }

  measure() {
    this.elements.insertAtCursor(new ES.MeasureSeparator());
    this.drawAll();
  }

  space() {
    this.elements.insertAtCursor(new ES.GroupSeparator());
    this.drawAll();
  }
  
  stroke(hand: string) {
    let stroke = new ES.Stroke();
    stroke.accented = false;
    stroke.grace = null;
    stroke.hand = hand;
    this.elements.insertAtCursor(stroke);
    this.drawAll();
  }

  modifyStroke(modification: any) {
    if (!this.elements.elementAtCursorIs(ES.Stroke)) {
      return;
    }
    let stroke = <ES.Stroke>this.elements.elementAtCursor();
    if (modification == this.grace) {
      let grace = stroke.grace == null ? 0 : parseInt(stroke.grace);
      let newGrace = (grace + 1) % 4;
      stroke.grace = newGrace == 0 ? null : newGrace.toString();
    }
    else if (modification == this.accent) {
      stroke.accented = !stroke.accented;
    }
    this.drawAll();
  }
}
