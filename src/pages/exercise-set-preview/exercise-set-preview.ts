import {SimpleChanges, ChangeDetectorRef, Component, ViewChildren, ViewChild, ElementRef, QueryList, EventEmitter} from '@angular/core';
import {NavController, ModalController, NavParams, LoadingController, Loading, PopoverController} from 'ionic-angular';
import * as ES from '../../providers/exercise-sets/exercise-sets';
import {ExerciseDisplay} from '../exercise-display/exercise-display';
import {MessagesPage, MessageType, IMessage} from '../messages/messages';
import {NewExerciseSetForm} from './new-exercise-set';
import {NewExerciseForm} from './new-exercise';
import {RepeatForm} from './repeat';
import {ExerciseConstraints} from './exercise-constraints';

import {Validators, FormBuilder, FormGroup, FormControl} from '@angular/forms';

@Component({
  selector: 'exercise-set-preview',
  templateUrl: 'exercise-set-preview.html',
  styles: [`.exercise-container {
    position: relative;
    padding: 10px;
  }`]
})
export class ExerciseSetPreviewPage {
  testGroup: FormGroup;

  title = '';
  constraints = new ExerciseConstraints();
  exercises: Array<ES.IExercise> = [];
  selectedExerciseSetId: number = null;
  editor: ExerciseEditor = null;
  editing = false;
  editIndex: number = null;
  @ViewChildren(ExerciseDisplay) displays: QueryList<ExerciseDisplay>;
  @ViewChildren('displayContainer') contents: QueryList<ElementRef>;
  private fontFactor = 1.75;
  private saveFields = ['notation', 'name', 'category', 'comments'];

  constructor(private navCtrl: NavController, 
    public exerciseSets: ES.ExerciseSets,
    private params: NavParams,
    private loadingCtrl: LoadingController,
    private popoverCtrl: PopoverController,
    private modal: ModalController,
    private changeDetect: ChangeDetectorRef,
    private formBuilder: FormBuilder) {
      this.testGroup = this.formBuilder.group({
        name: ['', Validators.maxLength(this.constraints.maxNameLength)],
        category: ['', Validators.maxLength(this.constraints.maxCategoryLength)],
        comments: ['', Validators.maxLength(this.constraints.maxExerciseCommentsLength)],
      });
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
    this.changeDetect.detectChanges();
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
      let height = display.draw(exercise, container, 
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

  private createSnapshot(exercise: ES.IExercise): Object {
    return {
      name: exercise.name,
      category:  exercise.category,
      comments: exercise.comments
    }
  }

  editExercise(idx: number) {
    this.setEditMode(true, idx);
    let display = <ExerciseDisplay>this.displays.toArray()[idx];
    let container = this.contents.toArray()[idx];
    let exercise = this.exercises[idx];
    exercise.display.takeSnapShot();
    this.editor = new 
      ExerciseEditor(exercise.display, () => {
        this.drawExercise(exercise, display, container);
      }, (position: number) => {
        display.drawCursor(position);
      }, () => {
        // Save
        let loading = this.showLoading();
        this.setEditMode(false);
        let fieldsToSave: string[] = [];
        for (let field of this.saveFields) {
          if (field == 'notation' && exercise.display.isDirty) {
            fieldsToSave.push(field);
          }
          else {
            if (exercise[field] != this.editor.snapShot[field]) {
              fieldsToSave.push(field);
            }
          }
        }
        this.exerciseSets.currentExerciseSet.
          save(exercise, fieldsToSave).subscribe({
            next: () => {
              for (let field of fieldsToSave) {
                if (field != 'notation') {
                  exercise[field] = this.editor.snapShot[field];
                }
              } 
              loading.dismiss();
            },
            error: (err: any) => {
              loading.dismiss();
              let message = MessagesPage.createMessage(
                  'Error', err, MessageType.Error);
              this.showMessages([message]);
            }
          });
      }, () => {
        // Cancel
        let snapShot = this.editor.snapShot;
        exercise.name = snapShot['name'];
        exercise.comments = snapShot['comments'];
        exercise.category = snapShot['category'];
        exercise.display.revertToSnapShot();
        display.hideCursor();
        this.setEditMode(false);
      }, this.modal, this.createSnapshot(exercise));
  }

  deleteExercise(idx: number) {

  }

  setEditMode(editing: boolean, editIndex?: number) {
    this.editing = editing;
    this.editIndex = editing ? editIndex : null;
    this.editor = !editing ? null : this.editor;
  } 
}

export class ExerciseEditor {
  // Need caps versions of these strokes
  rightHand = ES.Encoding.accectedRight;
  leftHand = ES.Encoding.accentedLeft;
  bothHands = ES.Encoding.accentedBoth;
  noHands = ES.Encoding.rest;

  enableStroke = false;
  atStroke = false;
  enableRepeat = false;
  enableAccent = false;
  enableGrace = false;
  
  constructor(private elements: ES.ExerciseElements,
    private drawExercise: () => void,
    private drawCursor: (position: number) => void,
    private onSave: () => void,
    private onCancel: () => void,
    private modal: ModalController,
    public snapShot: Object) {
    elements.cursorChanged = () => this.enforceRules();
    elements.resetCursor();
    this.drawCursor(this.elements.cursorPosition);
  }

  enforceRules() {
    this.enableRepeat = (this.elements.elementAtCursorIs(ES.MeasureSeparator)) &&
       (this.elements.measuresBeforeCursor() > 0);
    this.atStroke = this.elements.elementAtCursorIs(ES.Stroke);
    this.enableStroke = !this.elements.elementAtCursorIs(ES.Repeat);
    this.enableAccent = false;
    let element = this.elements.elementAtCursor();
    if (element instanceof ES.Stroke) {
      this.enableAccent = (<ES.Stroke>element).hand != ES.Encoding.rest;
    }
    this.enableGrace = this.enableAccent;
  }

  private drawAll() {
    this.drawExercise();
    this.drawCursor(this.elements.cursorPosition);
  }

  backspace() {
    this.elements.deleteAtCursor();
    this.drawAll();
  }

  forward() {
    if (this.elements.cursorPosition == this.elements.length) {
      return;
    }
    this.elements.cursorForward();
    this.drawCursor(this.elements.cursorPosition);
  }

  back() {
    if (this.elements.cursorPosition == 0) {
      return;
    }
    this.elements.cursorBack();
    this.drawCursor(this.elements.cursorPosition);
  }

  repeat() {
    this.modal.create(RepeatForm, {
      maxMeasures: this.elements.measuresBeforeCursor(),
      create: (numMeasures: number, numRepeats: number) => {
        let newRepeat = new ES.Repeat();
        newRepeat.numMeasures = numMeasures;
        newRepeat.numRepeats = numRepeats;
        this.elements.insertAtCursor(newRepeat);
        this.drawAll();
      }
    }).present();
  }

  accent() {
    let stroke = <ES.Stroke>this.elements.elementAtCursor(); 
    stroke.accented = !stroke.accented;
    this.drawAll();
  }

  grace() {
    (<ES.Stroke>this.elements.elementAtCursor()).cycleGrace();
    this.drawAll();
  }

  measure() {
    this.elements.insertAtCursor(new ES.MeasureSeparator());
    this.drawAll();
  }

  space() {
    this.elements.insertAtCursor(new ES.GroupSeparator());
    this.drawAll();
  }

  key() {

  }
  
  stroke(hand: string) {
    let stroke = new ES.Stroke();
    stroke.accented = false;
    stroke.grace = null;
    stroke.hand = hand;
    this.elements.insertAtCursor(stroke);
    this.drawAll();
  }

  saveExerciseEditing() {
    this.elements.cursorChanged = null;
    this.onSave();
  }

  editExerciseProperties() {
    this.modal.create(NewExerciseForm, {
      create: (formData: Object) => {
        this.snapShot['name'] = formData['name'];
        this.snapShot['category'] = formData['category'];
        this.snapShot['comments'] = formData['comments'];
      }
    }).present();
  }

  cancelExerciseEditing() {
    this.elements.cursorChanged = null;
    this.onCancel();
  }
}
