import {EventEmitter, Injectable, Output} from '@angular/core';
import {Http} from '@angular/http';
import {IExerciseSet, IExercise} from '../exercise-sets/exercise-sets';
import {AudioBuffers} from '../audio-buffers/audio-buffers';
import {ExerciseSets} from '../exercise-sets/exercise-sets';
import 'rxjs/add/operator/map';

enum MetronomeState {
  Started,
  Stopped,
  Paused
}

@Injectable()
export class Metronome {
  @Output() startExerciseSet = new EventEmitter();

  @Output() startDelay = new EventEmitter<void>();
  @Output() countdown = new EventEmitter<number>();
  @Output() endDelay = new EventEmitter();

  @Output() startCountIn = new EventEmitter();
  @Output() countInBeat = new EventEmitter();
  @Output() endCountIn = new EventEmitter();

  @Output() startExercises = new EventEmitter<IExercise[]>();
  @Output() startExercise = new EventEmitter<IExercise[]>();
  @Output() exerciseBeat = new EventEmitter<number>();
  @Output() repitition = new EventEmitter<number>();
  @Output() endExercise = new EventEmitter<IExercise[]>();

  @Output() endExerciseSet = new EventEmitter();
  
  
  private count: number;
  private pauseTime: number;
  private state = MetronomeState.Stopped;
  private scheduledClicks: Array<StartedNode> = 
      new Array<StartedNode>();
  private scheduledEvents: Array<StartedNode> = 
      new Array<StartedNode>();
  private currentDelay: AudioNode;
  private audioContext: AudioContext;
  private audioBuffers: AudioBuffers = null;
  private silence: AudioBuffer;

  constructor(private http: Http) {
  }

  load(audioBuffers: AudioBuffers) {
    this.audioBuffers = audioBuffers;
    this.audioContext = audioBuffers.audioContext;
    this.silence = audioBuffers.buffers['silence'];
  }

  schedule(time: number, audioBuffer: AudioBuffer, emitter: () => void) : void {
    // Schedule clicks and events
    let clickNode = this.audioContext.createBufferSource();
    this.scheduledClicks.push(new StartedNode(clickNode, time));
    clickNode.buffer = audioBuffer;
    clickNode.connect(this.audioBuffers.audioContext.destination);
    clickNode.start(time);

    let eventNode = this.audioContext.createBufferSource();
    this.scheduledEvents.push(new StartedNode(eventNode, time));
    eventNode.buffer = this.audioBuffers.silence;
    eventNode.connect(this.audioBuffers.audioContext.destination);
    eventNode.start(time);
    eventNode.onended = emitter;
  }

  play(exerciseSet: IExerciseSet, bpm: number, repititions: number, delaySeconds: number) {
    this.state = MetronomeState.Started;
    exerciseSet.initIterator();
    let currentExercise: IExercise = exerciseSet.next();
    if (currentExercise == null) {
      this.endExerciseSet.emit({});
      return;
    }
    let tempoInterval = 60 / bpm;
    let now = this.audioContext.currentTime;
    let nextStartTime = now;

    // Schedule countdown
    for (let s = 0; s < delaySeconds; s++) {
      let onended = () => {
        if (s == 0) {
          this.startDelay.emit(null);
        }
        this.countdown.emit(delaySeconds - s);
      };
      this.schedule(nextStartTime, this.audioBuffers.silence, onended);
      nextStartTime += 1;
    }
    // Perform count-in
    let beatCount = currentExercise.getNumberOfBeats();
    let c = currentExercise;
    let n = exerciseSet.nextExercise;
    this.schedule(nextStartTime - .01, this.audioBuffers.silence,
        () => this.startExercises.emit([c, n]));
    for (let beat = 1; beat <= beatCount; beat++) {
      let onended = () => {
        if (beat == 1) {
          this.startCountIn.emit(null);
        }
        this.countInBeat.emit(beat);
        if (beat == beatCount) {
          this.endCountIn.emit(null);
        }
      };
      this.schedule(nextStartTime, this.audioBuffers.buffers[(beat) + '-count'], onended);
      nextStartTime += tempoInterval;
    }
    // Play exercises
    this.playExercise(exerciseSet, nextStartTime, 
      tempoInterval, repititions, 1);
  }

  private playExercise(exerciseSet: IExerciseSet,
    nextStartTime: number, interval: 
    number, totalRepititions: number, 
    currentReptition: number) {
    if (this.state) {
      return;
    }
    let currentExercise = exerciseSet.currentExercise;
    let nextExercise = exerciseSet.nextExercise;
    let normalClick = this.audioBuffers.buffers['cowbell 1'];
    let endClick = this.audioBuffers.buffers['hip-hop snare']; 
    let beatsPerExercise = currentExercise.getNumberOfBeats();
    let click = currentReptition == totalRepititions ? endClick : normalClick;
    let startTime = nextStartTime;
    // Play a repitition of the exercise
    if (currentReptition == 1) {
      this.schedule(startTime - .001, this.audioBuffers.silence,
        () => this.startExercise.emit([currentExercise, nextExercise]));
    }
    this.schedule(startTime - .001, this.audioBuffers.silence,
      () => this.repitition.emit(currentReptition));
    for (let beat = 1; beat <= beatsPerExercise; beat++) {
      if (beat == beatsPerExercise) {
          this.schedule(startTime, click, () => {
            this.exerciseBeat.emit(beat);
            // Repeat exercise if there are more repititions to play
            if (currentReptition < totalRepititions) {
              this.playExercise(exerciseSet, startTime, interval, 
                totalRepititions, currentReptition + 1);
            }
            else {
              // Start next exercise if there is one.
              if (exerciseSet.next() != null) {
                this.schedule(startTime - .1, 
                  this.audioBuffers.silence, () => 
                  this.endExercise.emit([exerciseSet.currentExercise, 
                    exerciseSet.nextExercise]));
                this.playExercise(exerciseSet, startTime, interval, 
                  totalRepititions, 1);
              }
              else {
                this.schedule(nextStartTime, this.audioBuffers.silence, () => this.endExerciseSet.emit({}));
              }
            }
          });
      }
      else {
        this.schedule(startTime, click, 
          () => this.exerciseBeat.emit(beat));
      }
      startTime += interval;
    }
  }
/*
  pause() {
    // will have to change the start time of the call back 
    // in the last measure beat
    this.state = MetronomeState.Paused;
    this.pauseTime = this.audioContext.currentTime;
    let clicks = this.scheduledClicks;
    let events = this.scheduledEvents;
    //this.scheduledClicks = new Array<StartedNode>();
    //this.scheduledEvents = new Array<StartedNode>();
    for (let started of clicks) {
      started.node.stop();
      // put unplayed clicks in new schedule
      if (started.startTime > this.pauseTime) {
        this.resetSourceNode(started);
        this.scheduledClicks.push(started);
      }
    }
    for (let started of events) {
      started.node.stop();
      if (started.startTime > this.pauseTime) {
        this.resetSourceNode(started);
        this.scheduledEvents.push(started);
      }
    }

  }

  resetSourceNode(oldNode: StartedNode) {
    let newNode = this.audioContext.createBufferSource();
    newNode.connect(this.audioBuffers.audioContext.destination);
    newNode.buffer = oldNode.node.buffer;
    newNode.onended = oldNode.node.onended;
    oldNode.node = newNode;
  }

  resume() {

  }
*/
  stop() {
    this.state = MetronomeState.Stopped;
    for (let started of this.scheduledClicks) {
      started.node.stop();
    }
    for (let started of this.scheduledEvents) {
      started.node.stop();
    }
    this.scheduledClicks = new Array<StartedNode>();
    this.scheduledEvents = new Array<StartedNode>();
  }
}

class StartedNode {
  constructor(public node: AudioBufferSourceNode,
    public startTime: number) {}
}

export interface IDelayBeat {
  countdownValue: number;
}

class DelayBeat implements IDelayBeat {
  constructor(public countdownValue: number) {
  }
}