import {SimpleChanges, ChangeDetectorRef, Component, ViewChildren, ViewChild, ElementRef, QueryList, EventEmitter} from '@angular/core';
import {NavController, NavParams, LoadingController, Loading, ModalController, PopoverController, Content} from 'ionic-angular';
import * as ES from '../../providers/exercise-sets/exercise-sets';
import {ExerciseDisplay} from '../exercise-display/exercise-display';
import {MessagesPage, MessageType, IMessage} from '../messages/messages';
import {NewExerciseSetForm} from './new-exercise-set';
import {NewExerciseForm} from './new-exercise';
import {RepeatForm} from './repeat';
import {ExerciseConstraints} from './exercise-constraints';
import {WarningPage} from '../messages/warning';
import {ExerciseSetSelectorPage} from './exercise-set-selector';
import {Validators, FormBuilder, FormGroup, FormControl, FormsModule} from '@angular/forms';

@Component({
  selector: 'exercise-set-preview',
  templateUrl: 'exercise-set-preview.html',
  styles: [`.exercise-container {
    position: relative;
    padding: 10px;
  }`]
})
export class ExerciseSetPreviewPage {
  title = '';
  constraints = new ExerciseConstraints();
  exercises: Array<ES.IExercise> = [];
  selectedExerciseSet: ES.IExerciseSet = null;
  editor: ExerciseEditor = null;
  editing = false;
  editIndex: number = null;
  exerciseSetName: string;
  exerciseSetDetails: string;
  isOwner: boolean;
  @ViewChild(Content) content: Content;
  @ViewChildren(ExerciseDisplay) displays: QueryList<ExerciseDisplay>;
  @ViewChildren('displayContainer') contents: QueryList<ElementRef>;
  private fontFactor = 1.75;
  private saveFields = ['notation', 'name', 'category', 'comments'];

  constructor(private navCtrl: NavController, 
    public exerciseSets: ES.ExerciseSets,
    private params: NavParams,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController,
    private modal: ModalController,
    private popover: PopoverController,
    private changeDetect: ChangeDetectorRef) {
  }

  onResize($event) {
    this.displayExercises();
    if (this.editor) {
      this.editor.onResize();
    }
  }

  private get currentExerciseSetId(): number {
    return this.exerciseSets.currentExerciseSet ? 
      this.exerciseSets.currentExerciseSet.id : null;
  }

  private empty(s: string) {
    return (!s && s.length == 0);
  }

  private formatExerciseSetDetails() {
    if (!this.exerciseSets.currentExerciseSet) {
      this.isOwner = false;
      this.exerciseSetDetails = null;
      this.exerciseSetName = null;
      return;
    }
    this.isOwner = this.exerciseSets.currentExerciseSet.isOwner;
    this.exerciseSetName = this.exerciseSets.currentExerciseSet.name;
    let set = this.exerciseSets.currentExerciseSet;
    let category = (this.empty(set.category)) ? '' : ' (Category: ' + set.category + ')';
    let comments = (this.empty(set.comments)) ? '' : set.comments;
    this.exerciseSetDetails = comments + category;
  }

  selectExerciseSet() {
    this.modalCtrl.create(ExerciseSetSelectorPage,
      {
        onSelect: (id: number) => {
          this.changeCurrentExerciseSet(id);
        },
        currentSelectionId: this.currentExerciseSetId,
        exerciseSets: this.exerciseSets.items
      }).present();
  }
  
  updateExerciseSetMetadata() {
    this.modalCtrl.create(NewExerciseSetForm, {
      create: (formData: Object) => {
          if (!formData) {
            return;
          }
          this.exerciseSets.updateCurrentExerciseSetMetadata(formData).subscribe({
            next: () => {
              this.formatExerciseSetDetails();
            },
            error: (err: any) => {
              this.showMessages([MessagesPage.createMessage(
                'Error', 'Could not edit exercise set.', MessageType.Error
              )]);
            }
          });
      },
      initializer: {
        name: this.exerciseSets.currentExerciseSet.name,
        category: this.exerciseSets.currentExerciseSet.category,
        comments: this.exerciseSets.currentExerciseSet.comments
      }
    }).present();
  }

  newExerciseSet() {
    this.modalCtrl.create(NewExerciseSetForm, {
      create: (formData: Object) => {
          if (!formData) {
            return;
          }
          this.exerciseSets.newExerciseSet(formData).subscribe({
            next: (setId: number) => {
              this.changeCurrentExerciseSet(setId);
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
    this.modal.create(NewExerciseForm, {
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
              this.exercises.push(exercise);
              this.content.scrollToBottom();
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

  changeCurrentExerciseSet(exerciseSetId: number) {
    this.changeDetect.detectChanges();
    if (!exerciseSetId) {
      this.selectedExerciseSet = null;
      this.formatExerciseSetDetails();
      return;
    }
    let loading = this.showLoading();
    this.exerciseSets.setCurrentExerciseSet(exerciseSetId).subscribe(
      (x: any) => {
        loading.dismiss();
        this.loadExercises();
        this.formatExerciseSetDetails();
      },
      (error: any) => {
        loading.dismiss();
        this.modal.create(MessagesPage, {
          messages: [MessagesPage.createMessage('Error', error, MessageType.Error)]
        }).present();
      }
    )
  }

  ngAfterViewInit() {
    this.contents.changes.subscribe((changes: any) => this.displayExercises());
    this.formatExerciseSetDetails();
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
    this.modalCtrl.create(MessagesPage, {
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
    let display = <ExerciseDisplay>this.displays.toArray()[idx];
    let container = this.contents.toArray()[idx];
    let exercise = this.exercises[idx];
    exercise.display.takeSnapShot();
    this.setEditMode(true, idx);
    this.editor = new 
      ExerciseEditor(exercise.display, () => {
        this.drawExercise(exercise, display, container);
      }, (position: number) => {
        if (position < 0) {
          display.hideCursor();
          return;
        }
        display.drawCursor(position);
      }, (snapShot: Object) => {
        // Save
        let loading = this.showLoading();
        this.setEditMode(false);
        let fieldsToSave: string[] = [];
        for (let field of this.saveFields) {
          if (field == 'notation' && exercise.display.isDirty) {
            fieldsToSave.push(field);
          }
          else {
            if (exercise[field] != snapShot[field]) {
              exercise[field] = snapShot[field];
              fieldsToSave.push(field);
            }
          }
        }
        this.exerciseSets.currentExerciseSet.
          save(exercise, fieldsToSave).subscribe({
            next: () => {
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

  deleteExerciseSet() {
    this.exerciseSets.removeCurrentExerciseSet().subscribe({
      next: () => {
        console.log('ok ');
      },
      error: (err: any) => {
        console.log('error ');
        console.dir(err);
      }
    });
  }

  deleteExercise(idx: number) {
    this.popover.create(WarningPage, {
      message: 'Do you want to permanantly delete this exercise?',
      okCallback: () => {
        this.exerciseSets.currentExerciseSet.delete(
          this.exercises[idx]).subscribe({
            next: (obj: Object) => {
              this.exercises.splice(idx, 1);
            },
            error: (err: any) => {
              let message = MessagesPage.createMessage(
                "Error", "could not delete exercise", MessageType.Error);
            }
          });
      }
    })
  }

  removeExerciseSet() {

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
    private onSave: (snapShot: Object) => void,
    private onCancel: () => void,
    private modal: ModalController,
    public snapShot: Object) {
    elements.cursorChanged = () => this.enforceRules();
    elements.resetCursor();
    this.drawCursor(this.elements.cursorPosition);
  }

  onResize() {
    this.drawAll();
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
  
  stroke(hand: string) {
    let stroke = new ES.Stroke();
    stroke.accented = false;
    stroke.grace = ES.Encoding.noGrace;
    stroke.hand = hand;
    this.elements.insertAtCursor(stroke);
    this.drawAll();
  }

  saveExerciseEditing() {
    this.drawCursor(-1);
    this.elements.cursorChanged = null;
    this.onSave(this.snapShot);
  }

  editExerciseProperties() {
    this.modal.create(NewExerciseForm, {
      create: (formData: Object) => {
        this.snapShot['name'] = formData['name'];
        this.snapShot['category'] = formData['category'];
        this.snapShot['comments'] = formData['comments'];
      },
      initializer: this.snapShot
    }).present();
  }

  cancelExerciseEditing() {
    this.drawCursor(-1);
    this.elements.cursorChanged = null;
    this.onCancel();
  }
}
