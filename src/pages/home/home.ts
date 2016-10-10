import {ElementRef,Component, Input, Output, ChangeDetectorRef, EventEmitter, ViewChild,
  trigger, state, style, transition, animate} from '@angular/core';
import {NavController, Alert, Popover, PopoverController, Modal, ModalController,
   LoadingController, Loading, Content} from 'ionic-angular';
import {AudioBuffers} from '../../providers/audio-buffers/audio-buffers';
import {Metronome, IDelayBeat} from '../../providers/metronome/metronome';
import {ExerciseSets, IExercise} from '../../providers/exercise-sets/exercise-sets';
import {ExerciseDisplay} from '../exercise-display/exercise-display'
import {CountDownPage} from '../countdown/countdown';
import {LoginPage} from '../login/login';
import {ResourceLibrary} from '../../providers/resource-library/resource-library';
import {UserSettings} from '../../providers/user-settings/user-settings';

@Component({
  selector: 'home',
  styles: [
    `.exercise-set-info {
      color: #a6a6a6;
      font-size: .9em
    }`,
    `.info-label {
      color: #a6a6a6;
      font-size: .9em
    }`,
    `.info-value {
      padding-left: .5em;
      font-size: 1em;
    }`,
    `.exercise-card {
      overflow: visible;
    }`
  ],
  templateUrl: 'home.html',
  animations: [
    trigger('activation', [
      state('inactive', style({
        backgroundColor: '#eee',
        transform: 'scale(0.9)'
      })),
      state('active',   style({
      backgroundColor: '#cfd8dc',
      transform: 'scale(1.0)',
      })),
      state('off',   style({
      backgroundColor: '#a8b0b3',
      transform: 'scale(1.0)'
      })),
      transition('inactive => active', animate('100ms ease-in')),
      transition('active => inactive', animate('100ms ease-out'))
    ])
  ]
})
export class HomePage {
  private static startText = 'Start';
  private static stopText = 'Stop';
  private static pauseText = 'Pause';
  private static continueText = 'Continue';
  private static welcomeText = '';
  private isPaused = false;
  private canDetectChanges = false;
  pauseButtonText = '';
  isStarted = false;
  message = HomePage.welcomeText;
  currentExercise: IExercise = null;
  nextExercise: IExercise = null;
  startButtonText: string = HomePage.startText;
  pauseButtonHidden = true;
  // Communication with countdown popover
  @Output() countdown: EventEmitter<number> = new EventEmitter<number>();
  @Output() animateExercises: EventEmitter<void> = new EventEmitter<void>();
  // Control exercise display cards
  topDisplayState: DisplayState;
  bottomDisplayState: DisplayState;
  @ViewChild(Content) content: Content;
  @ViewChild('topDisplay') topExerciseDisplay: ExerciseDisplay;
  @ViewChild('bottomDisplay') bottomExerciseDisplay: ExerciseDisplay;
  @ViewChild('topContainer') topContainer: ElementRef;
  @ViewChild('bottomContainer') bottomContainer: ElementRef;
  // Countdown overlay
  private countdownDialog: Popover;
  private loginDialog: Modal;
  countdownPromise: Promise<any>;

  private loading: Loading;

  // Info properties
  count: number = 0;
  repetition: number = 0;
  bpm: number = 0;

  constructor(private navCtrl: NavController,
              private metronome: Metronome,
              public exerciseSets: ExerciseSets,
              private audioBuffers: AudioBuffers,
              private changeDetect: ChangeDetectorRef,
              private popoverController : PopoverController,
              private modalController: ModalController,
              public userSettings: UserSettings, 
              public resourceLibrary: ResourceLibrary,
              private loadingController: LoadingController) {
    this.initializeDisplay();
    this.loading = loadingController.create();
    userSettings.load()
    .then(resolve => resourceLibrary.load())
    .then(resolve => audioBuffers.loadAll('library.json', new AudioContext()))
    .then(resolve => metronome.load(audioBuffers))
    .then(resolve => {
      // Set up metronome event handlers
      metronome.startDelay.subscribe(count => {
        this.countdownDialog = popoverController.create(
          CountDownPage, {countdown: this.countdown});
        this.countdownPromise = 
          this.countdownDialog.present();
      });
      metronome.countdown.subscribe(count => {
        this.countdownPromise.then(value => {
        this.countdown.emit(count);
        })
      });
      metronome.startCountIn.subscribe(() => {
        this.changeProperties(['message'], ['Count-In']);
      });
      metronome.countInBeat.subscribe(count => {
        this.changeProperties(['count'], [count]);
      });
      metronome.startExercises.subscribe(exercise => {
        this.setDisplays(exercise[0], exercise[1]);
        this.changeProperties(['message'], ['Beat']);
      });
      metronome.endExercise.subscribe(exercise => {
        this.setDisplays(exercise[0], exercise[1]);
        this.changeProperties(['currentExercise', 'nextExercise'],
         [exercise[0], exercise[1]]);
      });
      metronome.exerciseBeat.subscribe(count => {
        this.changeProperties(['count'], [count]);
      });
      metronome.repitition.subscribe(repitition => {
        this.changeProperties(['repitition'], [repitition]);
      });
      metronome.endExerciseSet.subscribe(() => {
        this.resetPage();
      });
    })
    .then(resolved => {
      //this.loading.dismiss();
      this.loading = null;
    })
    .catch(reason => {
      // @todo need real error reporting
      //this.loading.dismiss();
      this.loading = null;
      alert(reason);
    });
  }

  private detectChanges() {
    if (this.canDetectChanges) {
      this.changeDetect.detectChanges();
    }
  }

  private initializeDisplay(): void {
    this.startButtonText = HomePage.startText;
    this.isStarted = false;
    this.topDisplayState = new DummyDisplayState();
    this.bottomDisplayState = new DummyDisplayState();
    this.repetition = 0;
    this.count = 0;
    this.bpm = this.userSettings.minTempo;
    if (this.topExerciseDisplay) {
      this.topExerciseDisplay.hide();
    }
    if (this.bottomExerciseDisplay) {
      this.bottomExerciseDisplay.hide();
    }
    this.detectChanges();
  }

  private setDisplays(currentExercise: IExercise, nextExercise: IExercise) {
    if (!this.isStarted) {
      return;
    }
    if (this.topDisplayState.isDummy()) {
      this.topDisplayState = new DisplayState(false, this.topExerciseDisplay);
      this.bottomDisplayState = new DisplayState(true, this.bottomExerciseDisplay);
    }
    for (let display of [this.topDisplayState, this.bottomDisplayState]) {
      display.exercise = display.isActive ? nextExercise : currentExercise;
      display.isActive = !display.isActive;
    }
    let topFontSize = 1.5 * Number.parseInt(getComputedStyle(
        this.topContainer.nativeElement).fontSize);
    let bottomFontSize = 1.5 * Number.parseInt(getComputedStyle(
        this.bottomContainer.nativeElement).fontSize);
    let maxHeight = this.content.height() * 0.4;
    let topWidth = this.topContainer.nativeElement.clientWidth - 
      this.getHorizontalPadding(this.topContainer);
    let bottomWidth = this.bottomContainer.nativeElement.clientWidth -
      this.getHorizontalPadding(this.bottomContainer);
    this.topDisplayState.draw(topWidth, maxHeight, topFontSize);
    this.bottomDisplayState.draw(bottomWidth, maxHeight, bottomFontSize);
    this.topContainer.nativeElement.height = this.topDisplayState.height;
    this.bottomContainer.nativeElement.height = this.bottomDisplayState.height;
    this.changeDetect.detectChanges();
  }

  private getHorizontalPadding(ref: ElementRef): number {
    let left = Number.parseFloat(getComputedStyle(ref.nativeElement).paddingLeft);
    let right = Number.parseFloat(getComputedStyle(ref.nativeElement).paddingRight);
    return Math.ceil(left + right);
  }

  private resetPage(): void {
    // Don't even ask...
    setTimeout(() => this.initializeDisplay(), 1000);
  }

  startClicked(event) {
    if (this.isStarted) {
      // Stop clicked
      this.metronome.stop();
      this.resetPage();
    }
    else {
      // Start clicked
      this.startButtonText = HomePage.stopText;
      this.pauseButtonText = HomePage.pauseText;
      this.bpm = this.userSettings.minTempo;
      this.metronome.play(this.exerciseSets.currentExerciseSet, 
        this.bpm, this.userSettings.numberOfRepititions, 
        this.userSettings.startDelaySeconds);
    }
    this.isStarted = !this.isStarted;
  }

  pauseClicked(event) {
    this.pauseButtonText = this.isPaused ? 
      HomePage.pauseText : HomePage.continueText;
    this.isPaused = !this.isPaused;
  }

  loginClicked(event) {
    this.loginDialog = this.modalController.create(
          LoginPage);
    this.loginDialog.present();
  }

  private changeProperties(properties: string [], values: any []) : void {
    for (let i = 0; i < properties.length;  i++) {
      this[properties[i]] = values[i];
    }
    this.detectChanges();
  }
}

export class DisplayState {
  private static currentText = 'Current Exercise';
  private static nextText = 'Next Exercise';
  private static activeStyle = 'active';
  private static inactiveStyle = 'inactive';
  private _exercise: IExercise;
  private _isActive: boolean;
  activationStyle: string;
  heading: string;
  height = 0;

  constructor(active: boolean, 
    public display: ExerciseDisplay)  {
      this.isActive = active;
  }

  public set exercise(exercise: IExercise) {
    this._exercise = exercise;
  }

  public draw(width: number, maxHeight: number, fontSize: number) {
    if (this._exercise != null) {
      this.height = this.display.draw(
        this._exercise, width, maxHeight, fontSize);
    }
  }

  public set isActive(state: boolean) {
    this._isActive = state;
    this.heading = state ? 
      DisplayState.currentText : DisplayState.nextText;
    this.activationStyle = state ? 
      DisplayState.activeStyle : DisplayState.inactiveStyle;
  }

  public get isActive(): boolean {
    return this._isActive;
  }

  isDummy(): boolean {
    return false;
  }
}

class DummyDisplayState extends DisplayState {
  constructor() {
    super(false, null);
    this.heading  = '';
    this.activationStyle = 'off';
  }

  isDummy(): boolean {
    return true;
  }
}
