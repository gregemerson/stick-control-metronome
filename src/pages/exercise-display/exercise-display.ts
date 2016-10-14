import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController } from 'ionic-angular';
import * as ES from '../../providers/exercise-sets/exercise-sets';

@Component({
  selector: 'exercise-display',
  styles: [`.exercise-canvas {
    border-style: solid;
    border-color: green;
  }`],
  template: '<canvas #exerciseCanvas class="exercise-canvas"></canvas>',
})
export class ExerciseDisplay {
  @ViewChild("exerciseCanvas") canvasElement: ElementRef; 
  private exerciseFont = "px Courier, monospace";
  private measureBar = '|';
  // Define the vertical placements of note component's bottom edge
  private topPaddingY: number;
  private accentY: number;
  private accentPaddingY: number;
  private letterY: number;
  private graceNoteY: number;
  private underscoreY: number;
  private groupingY: number;
  private bottomPaddingY: number;

  // Define the horzontal placements of note
  private noteX: number;
  private noteWidth: number;
  private noteHeight: number;
  private noteSpacing: number;

  private _context: CanvasRenderingContext2D = null;
  private canvas: HTMLCanvasElement;

  constructor(private navCtrl: NavController) {
  }

  public hide(): void {
    if (this.canvas != undefined) {
      this.canvas.width = 0;
      this.canvas.height = 0;
    }
  }

  private getContext(): CanvasRenderingContext2D {
    if (this._context == null) {
      this._context = this.canvas.getContext('2d');
      this._context.textAlign = 'left';
    }
    return this._context;
  }

  private static getDisplayWidth(ref: ElementRef): number {
    let left = Number.parseFloat(getComputedStyle(ref.nativeElement).paddingLeft);
    let right = Number.parseFloat(getComputedStyle(ref.nativeElement).paddingRight);
    return ref.nativeElement.clientWidth - Math.ceil(left + right);
  }

  draw(exercise: ES.IExercise, container: ElementRef, maxHeight: number, desiredFontSize: number): number {
    this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.canvas.width = ExerciseDisplay.getDisplayWidth(container);
    let lines = this.createLayout(exercise, maxHeight, desiredFontSize);
    this.canvas.height = lines.length * this.bottomPaddingY;
    let context = this.getContext();
    let elementIndex = 0;
    let display = exercise.display;
    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      this.resetNoteX();
      let lineStart = this.noteX;
      let lastIndex = lines[lineIdx];
      while (elementIndex <= lastIndex) {
        let element = display[elementIndex];
        if (element instanceof ES.StrokeGroup) {
          this.noteX = this.drawNotes(<ES.StrokeGroup>element);
        }
        else if (element instanceof ES.MeasureSeparator) {
          this.noteX = this.drawMeasureSeparator();
        }
        else if (element instanceof ES.GroupSeparator) {
          this.noteX = this.drawGroupSeparator();
        }
        else if (element instanceof ES.Repeat) {
          this.noteX = this.drawRepeat(<ES.Repeat>element);
        }
        elementIndex++;
      }
      this.moveNextLine();
    }
    return this.canvas.height;
  }

  // Set canvas height 
  private createLayout(exercise: ES.IExercise, maxHeight: number, fontSize: number): Array<number> {
    let display = exercise.display;
    let context = this.getContext();
    let calculatedFontSize = fontSize;
    let largestGroup = 0;
    for (let element of exercise.display) {

      if (typeof element == 'StrokeGroup') {
        if ((<ES.StrokeGroup>element).numberOfStrokes > largestGroup) {
          largestGroup = (<ES.StrokeGroup>element).numberOfStrokes;
        }
      }
    }
    while (calculatedFontSize > 1) {
      context.font = calculatedFontSize.toString() + this.exerciseFont;
      let currentWidthNeeded = largestGroup * context.measureText('X').width;
      if (currentWidthNeeded < this.canvas.width) {
        break;
      }
      else {
        calculatedFontSize--;
      }
    }
    
    let fontWidth = context.measureText('X').width;
    let lines = new Array<number>();
    let usedWidth = 0;
    for (let elementIndex = 0; elementIndex < exercise.display.length; elementIndex++) {
      let end = lines.length - 1;
      let element = exercise.display[elementIndex];
      let nextWidth = (typeof element == 'StrokeGroup') ? 
        fontWidth * (<ES.StrokeGroup>element).hand.length : fontWidth;
      if ((usedWidth + nextWidth) <= this.canvas.width) {
        usedWidth += nextWidth;
      }
      else {
        lines.push(elementIndex - 1);
        usedWidth = 0;
      }
    }
    if (exercise.display.length > 0) {
      lines.push(exercise.display.length - 1);
    }
    this.setupRegions(calculatedFontSize);
    return lines;  
  }

  private get selectedFontSize(): number {
    return this.letterY - this.accentPaddingY;
  }

  private setupRegions(fontSize: number): void {
    let context = this.getContext();
    let groupingFontSize = 0.6 * fontSize;
    context.font = fontSize + this.exerciseFont;
    this.noteWidth = context.measureText('A').width;
    this.topPaddingY =  0.1 * fontSize;
    this.accentY = this.topPaddingY + (0.2 * fontSize);
    this.accentPaddingY = this.accentY + (0.05 * fontSize);
    this.letterY = this.accentPaddingY + fontSize;
    this.graceNoteY = this.letterY + (0.2 * fontSize);
    this.groupingY = this.graceNoteY + (0.65 * fontSize);
    this.bottomPaddingY = this.groupingY + (0.1 * fontSize);
    this.noteHeight = this.bottomPaddingY;
    this.noteSpacing = 0.25 * this.noteWidth;
    this.resetNoteX();
  }

  private resetNoteX() {
    this.noteX = 0;
  }

  private moveNextLine() {
    let distanceY = this.bottomPaddingY;
    this.topPaddingY += distanceY;
    this.accentY += distanceY;
    this.accentPaddingY += distanceY;
    this.letterY += distanceY;
    this.graceNoteY += distanceY;
    this.underscoreY += distanceY;
    this.groupingY += distanceY;
    this.bottomPaddingY += distanceY;
    this.resetNoteX();
  }

  private drawNotes(notes: ES.StrokeGroup): number {
    let x = this.noteX;
    let context = this.getContext();
    let originalLineWidth = context.lineWidth;
    context.textBaseline = 'bottom';
    context.strokeStyle = 'black';
    context.font = this.selectedFontSize + this.exerciseFont;
    context.font = this.selectedFontSize.toString() + this.exerciseFont;
    let regionHeight = this.graceNoteY - this.letterY;
    let verticalCenter = this.letterY + (regionHeight/2); 
    for (let i = 0; i < notes.numberOfStrokes; i++) {
      let hand = notes.hand[i];
      let accented = notes.accented[i];
      let grace = notes.grace[i];
      if (accented) {
        this.drawAccent(x);
      }
      context.lineWidth = originalLineWidth;
      context.strokeText(hand, x, this.letterY);
      if (grace != null) {
        if (grace == ES.Encoding.buzz) {
          context.lineWidth = 0.1 * regionHeight;
          context.beginPath();
          context.moveTo(x, verticalCenter);
          context.lineTo(x + this.noteWidth, verticalCenter);
          context.stroke();
          context.closePath();          
        }
        else {
          let count = parseInt(grace);
          let circleDistance = this.noteWidth/(count + 1);
          let circleCenter = x + circleDistance;
          let radius = Math.min(.33 * circleDistance, .33 * regionHeight);
          context.beginPath();
          for (let i = 1; i <= count; i++) {
            context.arc(x + (i * circleDistance), verticalCenter,
               radius, 0, 2*Math.PI);
            context.fill();
          }
          context.closePath();
        }
      }
      if (i < (notes.numberOfStrokes - 1)) {
        x += this.noteSpacing;
      }
      x += this.noteWidth;
    }
    this.drawGroupLines(notes.numberOfStrokes);
    return x;
  }

  private drawRepeat(repeat: ES.Repeat): number {
    let startX = this.noteX;
    let endX = this.noteX + this.noteWidth;
    let regionHeight = (this.letterY - this.accentPaddingY);
    let regionHeightDivision = regionHeight/5;
    let verticalCenter = this.letterY - (regionHeight/2);
    let context = this.getContext();
    context.lineWidth = 0.06 * this.selectedFontSize;
    context.beginPath();
    context.moveTo(startX, this.letterY - regionHeightDivision);
    context.lineTo(endX, this.letterY - (3 * regionHeightDivision));
    context.stroke();
    context.moveTo(startX, this.letterY - (2 * regionHeightDivision));
    context.lineTo(endX, this.letterY - (4 * regionHeightDivision));
    context.stroke();    
    context.closePath();

    let regionWidthDivision = this.noteWidth/4;
    context.font = (2 * regionHeightDivision) + this.exerciseFont;
    let numWidth = context.measureText('X').width;
    context.textBaseline = 'bottom';
    context.strokeText(repeat.numRepeats.toString(), endX - numWidth, this.letterY);
    context.textBaseline = 'top';
    context.strokeText(repeat.numMeasures.toString(), startX, this.letterY);      
    return endX;
  }

  private drawGroupSeparator(): number {
    let context = this.getContext();
    context.textBaseline = 'bottom';
    context.strokeText(' ', this.noteX, this.letterY);
    return this.noteX + this.noteWidth;
  }

  private drawMeasureSeparator(): number {
    let context = this.getContext();
    let middleX = this.noteX + (this.noteWidth/2);
    context.lineWidth = this.noteWidth * 0.1;
    context.beginPath();
    context.moveTo(middleX, this.accentPaddingY);
    context.lineTo(middleX, this.letterY);
    context.stroke();
    context.closePath();
    return this.noteX + this.noteWidth;
  }

  private drawGroupLines(numNotes: number) {
    let context = this.getContext();
    let oldLineWidth = context.lineWidth;
    context.textBaseline = 'middle'; 
    let regionHeight = this.groupingY - this.graceNoteY;
    let regionWidth = this.noteWidth * numNotes;
    context.font = regionHeight + this.exerciseFont; 
    let halfCharWidth = context.measureText('X').width/2;
    let beginNumX = this.noteX + (regionWidth/2) - halfCharWidth;
    let endNumX = this.noteX + (regionWidth/2) + halfCharWidth;
    let lineY = this.graceNoteY + (regionHeight/2);
    context.strokeText(numNotes.toString(), beginNumX, lineY);
    context.lineWidth = 0.2 * regionHeight;
    context.strokeRect(this.noteX, this.graceNoteY, regionWidth, regionHeight);
    context.beginPath();
    context.moveTo(this.noteX, lineY);
    context.lineTo(beginNumX, lineY);
    context.moveTo(endNumX, lineY);
    context.lineTo(this.noteX + regionWidth, lineY);
    context.stroke();
    context.closePath();
    context.lineWidth = oldLineWidth;
  }

  drawAccent(x: number) {
    let context = this.getContext();
    let middleY = (this.topPaddingY + this.accentY)/2;
    let margin = 0.1 * this.selectedFontSize;
    context.lineWidth = .05 * this.selectedFontSize;
    context.beginPath();
    context.strokeStyle = "black";
    context.moveTo(x + margin, this.topPaddingY);
    context.lineTo(x + this.noteWidth - margin, middleY);
    context.lineTo(x + margin, this.accentY);
    context.stroke();
    context.closePath();
  }

  ngAfterViewInit() {
    this.canvas = <HTMLCanvasElement>this.canvasElement.nativeElement;
    this.canvas.width = 0;
    this.canvas.height = 0;
  }
}