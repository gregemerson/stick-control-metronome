import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {Authenticator, IAuthUser} from '../../providers/authenticator/authenticator';
import {HttpService} from '../../providers/http-service/http-service';
import {Observable} from 'rxjs/Observable';
import {Observer} from "rxjs";
import {ErrorObservable} from 'rxjs/observable/ErrorObservable';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';

@Injectable()
export class ExerciseSets {
  currentExerciseSet: IExerciseSet;
  private user: IAuthUser;
  items: Array<IExerciseSet> = [];
  
  constructor(private httpService: HttpService) {
  }

  load(user: IAuthUser): Observable<void> {
    this.user = user;
    this.currentExerciseSet = null;
    let currentId = user.settings.currentExerciseSetId;
    for (let key in user.rawExerciseSets) {
      let newSet = new ExerciseSet(user.rawExerciseSets[key]);
      this.items.push(newSet);
      if (newSet.id == user.settings.currentExerciseSetId) {
        this.currentExerciseSet = newSet;
      }
    }
    if (this.currentExerciseSet == null) {
      return Observable.create(observer => observer.next());
    }
    else {
      return (<ExerciseSet>this.currentExerciseSet).loadExercises(this.httpService, user);
    }
  }

  newExerciseSet(setAsCurrent: boolean): Observable<void> {
    return this.httpService.postPersistedObject(
      HttpService.ExerciseSetCollection, {})
      .map(result => {
        let newSet = new ExerciseSet(result);
        this.items.push(newSet);
        if (setAsCurrent) {
          this.currentExerciseSet = newSet;
        }
      });
  }

  newExercise(exerciseSetId: string): Observable<IExercise> {
    return this.httpService.postPersistedObject(
      HttpService.ExerciseCollection, {exerciseSetId: exerciseSetId})
      .map(result => new Exercise(result, this.user));
  }
  
  public setCurrentExerciseSet(exerciseSetId: string): Observable<void> {
    if (exerciseSetId == this.currentExerciseSet.id) {
      return Observable.never<void>();
    }
    (<ExerciseSet>this.currentExerciseSet).unloadExercises();
    this.currentExerciseSet = this.findExerciseSet(exerciseSetId);
    return (<ExerciseSet>this.currentExerciseSet).loadExercises(this.httpService, this.user);
  }

  private findExerciseSet(exerciseSetId: string): ExerciseSet {
    for (let exerciseSet of this.items) {
      if (exerciseSet.id == exerciseSetId) {
        return <ExerciseSet>exerciseSet;
      }
    }
    return null;
  }
}

export interface IExerciseSet {
  id: string;
  currentExercise: IExercise;
  nextExercise: IExercise;
  name: string;
  category: string;
  next(): IExercise;
  initIterator(): void;
  exerciseOrdering: Array<string>;
}

class ExerciseSet implements IExerciseSet{
  currentExercise: IExercise = null;
  nextExercise: IExercise = null;
  exerciseOrdering: Array<string>;
  name: string;
  category: string;
  id: string;
  private ownerId: string;
  private nextIndex: number = -1;
  private exerciseCount = 0;
  // Exercises are loaded on-demand
  private exercises: {[key: string]: Exercise} = {};
  private disabledExercises: Array<string> = null;
  private filter = '?filter[include][exercises]';
  private _exercisesLoaded = false;
  private exerciseKeys: Array<string> = [];

  constructor(rawExerciseSet: Object) {
    this.name = rawExerciseSet['name'];
    this.id = rawExerciseSet['id'];
    this.ownerId = rawExerciseSet['ownerId'];
    this.category = rawExerciseSet['category'];
    this.disabledExercises = rawExerciseSet['disabledExercises'];
    this.exerciseOrdering = rawExerciseSet['exerciseOrdering'];
    this.initIterator();
  }

  disableExercise(exerciseId: string) {
    let exercise = this.exercises[exerciseId]; 
    if (exercise.disabled) {
      return;
    }
    exercise.disabled = true;
    this.disabledExercises.push(exerciseId);
  }

  enableExercise(exerciseId: string) {
    let exercise = this.exercises[exerciseId]; 
    if (!exercise.disabled) {
      return;
    }
    exercise.disabled = false;
    let index = this.disabledExercises.indexOf(exerciseId);
    this.disabledExercises.splice(index, 1);
  }

  get exercisesLoaded() {
    return this._exercisesLoaded;
  }

  loadExercises(httpService: HttpService, user: IAuthUser): Observable<void> {
    return httpService.getPersistedObject(HttpService.ExerciseSetCollection + 
      this.id + this.filter, Authenticator.newRequestOptions())
    .map(exerciseSet => {
      let exercises = <Array<Object>>exerciseSet['exercises'];
      for (let exercise of exercises) {
        let disabled = this.disabledExercises.indexOf(exercise['id']) >= 0;
        this.exerciseKeys.push(exercise['id']);
        this.exercises[exercise['id']] = new Exercise(exercise, user);
      }
      this._exercisesLoaded = true;
    });
  }

  unloadExercises() {
    for (let key in this.exerciseKeys) {
      delete this.exercises[key];
    }
    this.exerciseKeys.length = 0;
    this._exercisesLoaded = false;
  }

  next() : IExercise {
    this.currentExercise = this.nextExercise;
    if (this.currentExercise != null) {
      this.setupNextExercise();
    }
    return this.currentExercise;
  }

  initIterator () {
    this.currentExercise = null;
    this.nextIndex = -1;
    this.setupNextExercise();
  }

  private setupNextExercise() {
    this.nextIndex = this.getNextEnabledIndex(this.nextIndex);
    this.nextExercise = (this.nextIndex >= 0) ? 
      this.getExerciseByIndex(this.nextIndex) : null;
  }

  private getNextEnabledIndex(index: number): number {
    let nextIdx = index + 1;
    while (nextIdx < this.exerciseKeys.length) {
      if (!this.getExerciseByIndex(nextIdx).disabled) {
        return nextIdx;
      }
      nextIdx++;
    }
    return -1;
  }

  private getExerciseByIndex(index: number) {
    return this.exercises[this.exerciseKeys[index]];
  }
}

export interface IExercise {
  id: string; 
  name: string;
  category: string;
  isOwner: boolean;
  display: Array<ExerciseElement>;
  comments: string;
  getNumberOfBeats(): number;
  disabled: boolean;
}

// beats per measure must be bounded because of count in recording constraints
class Exercise implements IExercise {
  private _display: Array<ExerciseElement>;
  private _id: string;
  private _isOwner: boolean;
  public name: string;
  public category: string;
  public comments: string;
  public disabled = false;

  constructor(rawExercise: Object, user: IAuthUser) {
    this._display = Encoding.decode(rawExercise['notation']);
    this._id = rawExercise['id'];
    this._isOwner = user.id == rawExercise['ownerId'];
    this.name = rawExercise['name'];
    this.category = rawExercise['category'];
    if (rawExercise.hasOwnProperty('comments')) {
      this.comments = rawExercise['comments'];
    }
  }

  get id(): string {
    return this._id;
  }

  get isOwner(): boolean {
    return this._isOwner;
  }

  get display(): Array<ExerciseElement> {
    return this._display;
  }

  getNumberOfBeats(): number {
    let numBeats = 0;
    let groupCount = 0;
    let measureBeats = [];
    let measureIndex = 0;
    // Skip first measure bar
    let elements = this.display;
    for (let i = 1; i < elements.length; i++) {
      if (typeof elements[i] == 'GroupSeparator') {
        groupCount++;
      }
      if (typeof elements[i] == 'MeasureSeparator') {
        if (typeof elements[i - 1] == 'MeasureSeparator') {
          throw 'Invalid exercise: empty measure';
        }
        measureBeats.push(groupCount);
        numBeats += groupCount;
        groupCount = 0;
      }
      if (typeof elements[i] == 'Repeat') {
        let last = measureBeats.length - 1;
        let repeat = <Repeat>elements[i];
        let beatTotal = 0;
        for (let j = last; j >= last - repeat.numMeasures; --j) {
          beatTotal += measureBeats[j];
        }
        numBeats += beatTotal * repeat.numRepeats;
      }
    }
    return numBeats;
  }
}

export class Encoding {
  static right = 'r';
  static left = 'l';
  static both = 'b';
  static accectedRight = 'R';
  static accentedLeft = 'L';
  static accentedBoth = 'B'; // or bass
  static rest = '-';
  static measureSeparator = '|';
  static groupSeparator = ' ';
  static exerciseStart = '#';
  static graceStart = '[';
  static graceEnd = ']';
  static flam = 'f';
  static drag = 'd';
  static ruff = 'r';
  static buzz = 'z';
  static repeatStart = '<';
  static repeatEnd = '>';
  static repeatDivider = ':';
  static strokes = 'rlbRLB-';
  static groupRest = '-';
  static graces = 'fdrz';

  static encode(elements: Array<ExerciseElement>): string {
    let encoding = '';
    for (let element of elements) {
      encoding += element.encoding;
    }
    return encoding;
  }

  static decode(encoded: string): Array<ExerciseElement> {
    let elements: Array<ExerciseElement> = [];
    let beginExercise = false;
    let encodedIndex = 0;
     while (encodedIndex < encoded.length) {
      // Move to the playable portion of the display
      if (!beginExercise) {
        if (encoded[encodedIndex] == this.exerciseStart) {
          beginExercise = true;
        }
        encodedIndex += this.exerciseStart.length;
        continue;
      }
      if (encoded[encodedIndex] == this.repeatStart) {
        let repeat = new Repeat(0,0);
        encodedIndex = this.parseRepeat(encoded, encodedIndex, repeat);
        elements.push(repeat);
        continue;
      }
      if (encoded[encodedIndex] == this.graceStart || this.strokes.includes(encoded[encodedIndex])) {
        let stroke = new Stroke('', '', false);
        encodedIndex = this.parseStroke(encoded, encodedIndex, stroke);
        elements.push(stroke);
        continue;
      }
      if (encoded[encodedIndex] == this.measureSeparator) {
        elements.push(new MeasureSeparator());
        encodedIndex += this.measureSeparator.length;
        continue;
      }
      if (encoded[encodedIndex] == this.groupSeparator) {
        elements.push(new GroupSeparator());
        encodedIndex += this.groupSeparator.length;
        continue;
      }
      if (encoded[encodedIndex] == this.rest) {
        elements.push(new Rest());
        encodedIndex += this.rest.length;
        continue;
      }
      throw encoded[encodedIndex] + " isn't the start of an exercise element";
    }
    return elements;
  }

  private static parseStroke(display: string, index: number, stroke: Stroke): number {
    stroke.grace = null;
    let increment = 0;
    if (display[index] == this.graceStart) {
      if (display[index + 2] != this.graceEnd || !this.graces.includes(display[index + 1])) {
        this.throwInvalid();
      }
      stroke.grace = display[index + 1];
      increment += 3;
    }
    stroke.hand = display[index + increment].toUpperCase();
    stroke.accented = (display[index + increment] == stroke.hand) && !this.groupRest;
    return index + increment + 1;
  }

  private static throwInvalid() {
    throw 'invalid exercise';
  }

  private static parseRepeat(display: string, index: number, repeat: Repeat): number {
    if (display[index] != this.repeatStart) {
      Encoding.throwInvalid();
    }
    let end = display.indexOf(this.repeatEnd);
    if (end <= index + 1) {
      Encoding.throwInvalid();
    }
    let values = display.substring(index + 1, end)
      .split(this.repeatDivider);
    if (values.length != 2) {
      Encoding.throwInvalid();
    }
    let numRepeats = +values[0];
    let numMeasures = +values[1];
    if (Number.isNaN(numRepeats) || Number.isNaN(numMeasures)) {
      Encoding.throwInvalid();
    }
    repeat.numRepeats = numRepeats;
    repeat.numMeasures = numMeasures;
    return end + 1;
  }

  static getMeasureCount(encoding: string) {
    if (encoding.length == 0) {
      return 0;
    }
    let count = 1;
    for (let i = 0; i < encoding.length; i++) {
      if (encoding[i] == Encoding.measureSeparator) {
        count++;
      }
    }
    return count;
  }

  static satisfiesBeatsPerMeasureConstraint(encoding: string): boolean {
    // @todo
    return false;
  }
}

export class ExerciseElement {
  get encoding(): string {
    throw 'encoding pure virtual';
  }
}

export class Rest extends ExerciseElement {
  get encoding(): string {
    return Encoding.rest;
  }
}

export class MeasureSeparator extends ExerciseElement {
  get encoding(): string {
    return Encoding.measureSeparator;
  }
}

export class GroupSeparator extends ExerciseElement {
  get encoding(): string {
    return Encoding.groupSeparator;
  }
}

export class Repeat extends ExerciseElement {
  constructor(public numRepeats: number, public numMeasures: number) {
    super();
  }
  get encoding(): string {
    return Encoding.repeatStart + this.numMeasures + 
          Encoding.repeatDivider + this.numRepeats + Encoding.repeatEnd;
  }
}

export class Stroke extends ExerciseElement {
  constructor(public hand: string, public grace: string, public accented: boolean) {
    super();
  }
  get encoding(): string {
    let grace = '';
    if (this.grace != null) {
      grace += Encoding.graceStart + this.grace + Encoding.graceEnd;
    }
    grace += this.accented ? this.hand : this.hand.toLowerCase();
    return grace; 
  }
}