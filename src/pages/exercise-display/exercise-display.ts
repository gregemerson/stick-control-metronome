import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController } from 'ionic-angular';
import * as ES from '../../providers/exercise-sets/exercise-sets';

@Component({
  selector: 'exercise-display',
  styles: [`.exercise-canvas {
    border-style: none;
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

  private graceNotePercentage = 0.6;
  private groupingFontSizePercent = 0.6;
  private leftPaddingPercent = 0.1;
  private topPaddingPercent = 0.1;
  private bottomPaddingPercent = 0.1;
  
  private numberOfLines: number;

  // Define the horzontal placements of note
  private noteX: number;
  private noteFontSize: number;
  private noteWidth: number;
  private noteHeight: number;

  private _context: CanvasRenderingContext2D = null;
  private canvas: HTMLCanvasElement;

  public get height(): number {
    return this.numberOfLines * this.noteHeight;
  }

  public get width(): number {
    return this.canvas.width;
  }

  public hide(): void {
    if (this.canvas != undefined) {
      this.canvas.width = 0;
      this.canvas.height = 0;
    }
  }

  constructor(private navCtrl: NavController) {
  }

  // All sizing is done relative to the font size
  private get groupingFontSize(): number {
    return this.groupingFontSizePercent * this.noteFontSize;
  }

  private get topPaddingSize(): number {
    return this.topPaddingPercent * this.noteFontSize;
  }

  private get bottomPaddingSize(): number {
    return this.bottomPaddingPercent * this.noteFontSize;
  }

  private get leftPaddingSize(): number {
    // For now
    return 0;
    //return this.leftPaddingPercent * this.currentFontSize;
  }

  private getContext(): CanvasRenderingContext2D {
    if (this._context == null) {
      this._context = this.canvas.getContext('2d');
      this._context.textBaseline = 'bottom';
      this._context.textAlign = 'left';
      this._context.textBaseline = 'bottom';
    }
    return this._context;
  }

  draw(exercise: ES.IExercise, width: number, maxHeight: number, desiredFontSize: number): number {
    this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.canvas.width = width;
    let lines = this.createLayout(exercise, maxHeight, desiredFontSize);
    let context = this.getContext();
    let elementIndex = 0;
    let display = exercise.display;
    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      this.resetNoteX();
      let lineStart = this.noteX;
      let lastIndex = lines[lineIdx];
      while (elementIndex <= lastIndex) {
        let element = display[elementIndex]; 
        if (typeof element == 'StrokeGroup') {
          this.noteX = this.drawNotes(<ES.StrokeGroup>element);
        }
        else if (typeof element == 'MeasureSeparator') {
          this.noteX = this.drawMeasureSeparator();
        }
        else if (typeof element == 'GroupSeparator') {
          this.noteX = this.drawGroupSeparator();
        }
        else if (typeof element == 'Repeat') {
          this.noteX = this.drawRepeat(<ES.Repeat>element);
        }
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
      if ((usedWidth + nextWidth) < this.canvas.width) {
        usedWidth += nextWidth;
      }
      else {
        lines.push(elementIndex - 1);
        usedWidth = 0;
      }
    }
    this.canvas.height = lines.length * this.noteHeight;
    this.setupRegions(calculatedFontSize);
    console.log('setting layout ');
    for (let j of lines) {
      console.log(j);
    }
    return lines;  
  }

  private setupRegions(fontSize: number): void {
    let context = this.getContext();
    context.font = fontSize + this.exerciseFont;
    this.noteWidth = context.measureText('A').width;
    this.topPaddingY = this.topPaddingSize;
    this.accentY = this.topPaddingY + (.2 * this.noteFontSize);
    this.accentPaddingY = this.accentY + (.05 * this.noteFontSize);
    this.letterY = this.accentPaddingY + this.noteFontSize;
    this.graceNoteY = this.letterY + (.15 * this.noteFontSize);
    this.underscoreY = this.graceNoteY + (.1 * this.noteFontSize);
    this.groupingY = this.underscoreY + (this.groupingFontSize);
    this.bottomPaddingY = this.groupingY + this.bottomPaddingSize;
    this.noteHeight = this.bottomPaddingY;
    this.resetNoteX();
  }

  private resetNoteX() {
    this.noteX = this.leftPaddingSize;
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
    context.font = this.noteFontSize.toString() + this.exerciseFont;
    let regionHeight = this.graceNoteY - this.letterY;
    let verticalCenter = this.letterY + (regionHeight/2); 
    for (let i = 0; i < notes.numberOfStrokes; i++) {
      let hand = notes[i];
      let accented = notes.accented[i];
      let grace = notes.grace[i];
      if (accented) {
        this.drawAccent(this.noteX + (i * this.noteWidth));
      }
      context.textBaseline = 'bottom';
      context.strokeText(hand, this.noteX, this.letterY);
      if (grace != null) {
        if (grace == ES.Encoding.buzz) {
          context.lineWidth = .07 * regionHeight;
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
    context.lineWidth = 0.1 * this.noteFontSize;
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
    let margin = 0.1 * this.noteFontSize;
    let lineLength = (this.noteWidth * numNotes) + (2 * margin);
    let barLength = margin + ((this.underscoreY - this.letterY)/2);
    let p = {x: this.noteX - margin, y: this.letterY - margin};
    context.lineWidth = .03 * this.noteFontSize;
    // Draw |__________________________| under grouping
    context.beginPath();
    context.moveTo(p.x, p.y);
    p.y = p.y + barLength;
    context.lineTo(p.x, p.y);
    p.x = p.x + lineLength;
    context.lineTo(p.x, p.y);
    p.y = p.y - barLength;
    context.lineTo(p.x, p.y);
    context.stroke();
    context.closePath();
    // Center the grouping count under the element above.
    let numberFontSize = this.groupingY - this.underscoreY;
    context.font = numberFontSize + this.exerciseFont;
    let numberX = this.noteX + lineLength/2 - this.noteFontSize/2;
    context.textBaseline = 'alphabetic';
    context.strokeText(numNotes.toString(), numberX, this.groupingY);
  }

  drawAccent(x: number) {
    let context = this.getContext();
    let middleY = (this.topPaddingY + this.accentY)/2;
    let margin = 0.1 * this.noteFontSize;
    context.lineWidth = .05 * this.noteFontSize;
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