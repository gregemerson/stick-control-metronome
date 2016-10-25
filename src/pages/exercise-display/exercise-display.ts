import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController } from 'ionic-angular';
import * as ES from '../../providers/exercise-sets/exercise-sets';

@Component({
  selector: 'exercise-display',
  styles: [
    `.exercise-canvas {
        z-index: 2;
        border-style: dotted;
        border-color: green;       
     }`,
    `.cursor-canvas {
        z-index: 3;
        position: absolute;
        border-style: dotted;
        border-color: red;
     }`
  ],
  template: `<canvas #exerciseCanvas class="exercise-canvas"></canvas>
             <canvas #cursorCanvas class="cursor-canvas"></canvas>`,
})
export class ExerciseDisplay {
  @ViewChild("exerciseCanvas") canvasElement: ElementRef;
  @ViewChild("cursorCanvas") cursorElement: ElementRef; 
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

  private _exerciseContext: CanvasRenderingContext2D = null;
  private _cursorContext: CanvasRenderingContext2D = null;
  private exerciseCanvas: HTMLCanvasElement;
  private cursorCanvas: HTMLCanvasElement;

  private cursorPosition: number;
  private positionCount: number;

  private endOfLineIndices = new Array<number>();
  private container: ElementRef;
  showCursor = false;
  

  constructor(private navCtrl: NavController) {
  }

  public hide(): void {
    if (this.exerciseCanvas != undefined) {
      this.exerciseCanvas.width = 0;
      this.exerciseCanvas.height = 0;
    }
  }

  private getExerciseContext(): CanvasRenderingContext2D {
    if (this._exerciseContext == null) {
      this._exerciseContext = this.exerciseCanvas.getContext('2d');
      this._exerciseContext.textAlign = 'left';
    }
    return this._exerciseContext;
  }

  private getCursorContext(): CanvasRenderingContext2D {
    if (this._cursorContext == null) {
      this._cursorContext = this.cursorCanvas.getContext('2d');
    }
    return this._cursorContext;
  }

  private getDisplayWidth(): number {
    let left = Number.parseFloat(getComputedStyle(this.container.nativeElement).paddingLeft);
    let right = Number.parseFloat(getComputedStyle(this.container.nativeElement).paddingRight);
    return this.container.nativeElement.clientWidth - Math.ceil(left + right);
  }

  private positionInContainer() {
    let width = this.getDisplayWidth();
    this.exerciseCanvas.width = width;
    this.cursorCanvas.width = width;
    this.cursorCanvas.style.top =  getComputedStyle(
      this.container.nativeElement).paddingTop;
    this.cursorCanvas.style.left = getComputedStyle(
      this.container.nativeElement).paddingLeft; 
  }

  drawCursor(position: number) {
    let lineIndex = 0;
    let noteIndex = 0;
    let lastBreak = -1;
    for (let endOfLine of this.endOfLineIndices) {
      if (position <= endOfLine) {
        noteIndex = position - (lastBreak + 1);
        break;
      }
      lineIndex++;
    }
    this.clearCanvas(this.cursorCanvas);
    let context = this.getCursorContext();
    this.resetNoteX();
    let x = noteIndex * this.noteWidth + this.noteX;
    let y = lineIndex * this.bottomPaddingY;
    console.log('drawing at x = ' + x + ' y = ' + y);
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(x, y);
    y += this.bottomPaddingY;
    context.lineTo(x, y);
    context.stroke();
    context.closePath();
  }

  private clearCanvas(canvas: HTMLCanvasElement) {
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  }

  draw(exercise: ES.IExercise, container: ElementRef, maxHeight: number, 
    desiredFontSize: number): number {
    this.container = container;
    this.clearCanvas(this.exerciseCanvas);
    this.clearCanvas(this.cursorCanvas);
    this.positionInContainer();
    this.createLayout(exercise, maxHeight, desiredFontSize);
    this.exerciseCanvas.height = this.endOfLineIndices.length * this.bottomPaddingY; 
    this.cursorCanvas.height = this.exerciseCanvas.height;
    let context = this.getExerciseContext();
    let elementIndex = 0;
    let display = exercise.display;
    for (let lineIdx = 0; lineIdx < this.endOfLineIndices.length; lineIdx++) {
      this.resetNoteX();
      let lineStart = this.noteX;
      let lastIndex = this.endOfLineIndices[lineIdx];
      let firstWrite = true;
      while (elementIndex <= lastIndex) {
        let element = display.getElement(elementIndex);
        if (element instanceof ES.Stroke) {
          let drawInfo = this.drawNotes(display, elementIndex);
          // Move index to end of stroke group
          elementIndex += drawInfo.noteCount - 1;
          this.noteX = drawInfo.endX;
        }
        else if (element instanceof ES.MeasureSeparator) {
          this.noteX += this.drawMeasureSeparator();
        }
        else if (element instanceof ES.GroupSeparator) {
          if (!firstWrite) {
            this.noteX += this.drawGroupSeparator();
          }
        }
        else if (element instanceof ES.Repeat) {
          this.noteX += this.drawRepeat(<ES.Repeat>element);
        }
        firstWrite = false;
        elementIndex++;
      }
      this.moveNextLine();
    }
    return this.exerciseCanvas.height;
  }

  private createLayout(exercise: ES.IExercise, maxHeight: number, fontSize: number) {
    let context = this.getExerciseContext();
    let calculatedFontSize = fontSize;
    let longestGroup = exercise.display.longestStrokeGroup();
    // Guarantee that the longest stroke group will fit within a line
    while (calculatedFontSize > 0) {
      context.font = calculatedFontSize.toString() + this.exerciseFont;
      let currentWidthNeeded = longestGroup * context.measureText('X').width;
      if (currentWidthNeeded <= this.exerciseCanvas.width) {
        break;
      }
      else {
        calculatedFontSize--;
      }
    }
    // Now find line breaks which can only be ' ' or '|'
    this.endOfLineIndices.length = 0;
    let fontWidth = context.measureText('X').width;
    let usedWidth = 0;
    let breakCandidate = 0;
    let previousBreak = -1;
    for (let elementIndex = 0; elementIndex < exercise.display.length; elementIndex++) {
      let element = exercise.display.getElement(elementIndex);
      // Breakable means that the elements immediately following it can be put on new line.
      let isBreakable = !(element instanceof ES.Stroke);
      if ((usedWidth + this.noteWidth) > this.exerciseCanvas.width) {
        let charsAfterBreak;
        if (isBreakable) {
          charsAfterBreak= (element instanceof ES.GroupSeparator) ? 0 : 1;
          this.endOfLineIndices.push(elementIndex - charsAfterBreak);
        }
        else {
          this.endOfLineIndices.push(breakCandidate);
          breakCandidate = elementIndex;
          charsAfterBreak = elementIndex - breakCandidate; 
        }
        usedWidth = calculatedFontSize * charsAfterBreak;
      }
      else if (isBreakable) {
        breakCandidate = elementIndex;
      }
    }
    this.endOfLineIndices.push(exercise.display.length - 1);
    this.setupRegions(calculatedFontSize);
  }

  private get selectedFontSize(): number {
    return this.letterY - this.accentPaddingY;
  }

  private setupRegions(fontSize: number): void {
    let context = this.getExerciseContext();
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

  private drawNotes(elements: ES.ExerciseElements, startIndex: number): NoteDrawInfo {
    let x = this.noteX;
    let context = this.getExerciseContext();
    let originalLineWidth = context.lineWidth;
    context.textBaseline = 'bottom';
    context.strokeStyle = 'black';
    context.font = this.selectedFontSize + this.exerciseFont;
    let regionHeight = this.graceNoteY - this.letterY;
    let verticalCenter = this.letterY + (regionHeight/2);
    let end = startIndex;
    while(end < elements.length) {
      end++;
      if (!(elements.getElement(end) instanceof ES.Stroke))
      {
        break;
      }
    }
    for (let strokeIndex = startIndex; strokeIndex < end; strokeIndex++) {
      let stroke = <ES.Stroke>elements.getElement(strokeIndex);
      if (stroke.accented) {
        this.drawAccent(x);
      }
      context.lineWidth = originalLineWidth;
      context.strokeText(stroke.hand, x, this.letterY);
      if (stroke.grace != null) {
        if (stroke.grace == ES.Encoding.buzz) {
          context.lineWidth = 0.1 * regionHeight;
          context.beginPath();
          context.moveTo(x, verticalCenter);
          context.lineTo(x + this.noteWidth, verticalCenter);
          context.stroke();
          context.closePath();          
        }
        else {
          let count = parseInt(stroke.grace);
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
      if (strokeIndex < end - 1) {
        x += this.noteSpacing;
      }
      x += this.noteWidth;
    }
    this.drawGroupLines(end - startIndex);
    return  new NoteDrawInfo(end - startIndex, x);
  }

  private drawRepeat(repeat: ES.Repeat): number {
    let startX = this.noteX;
    let endX = this.noteX + this.noteWidth;
    let regionHeight = (this.letterY - this.accentPaddingY);
    let regionHeightDivision = regionHeight/5;
    let verticalCenter = this.letterY - (regionHeight/2);
    let context = this.getExerciseContext();
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
    return this.noteWidth;
  }

  private drawGroupSeparator(): number {
    return this.noteWidth;
  }

  private drawMeasureSeparator(): number {
    let context = this.getExerciseContext();
    let middleX = this.noteX + (this.noteWidth/2);
    context.lineWidth = this.noteWidth * 0.1;
    context.beginPath();
    context.moveTo(middleX, this.accentPaddingY);
    context.lineTo(middleX, this.letterY);
    context.stroke();
    context.closePath();
    return this.noteWidth;
  }

  private drawGroupLines(numNotes: number) {
    let context = this.getExerciseContext();
    let oldLineWidth = context.lineWidth;
    context.textBaseline = 'middle'; 
    let regionHeight = this.groupingY - this.graceNoteY;
    // Account for notes and note spacing
    let regionWidth = (this.noteWidth * numNotes) + ((numNotes - 1) * this.noteSpacing);
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
    let context = this.getExerciseContext();
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
    this.exerciseCanvas = <HTMLCanvasElement>this.canvasElement.nativeElement;
    this.cursorCanvas = <HTMLCanvasElement>this.cursorElement.nativeElement;
    this.exerciseCanvas.width = 0;
    this.exerciseCanvas.height = 0;
    this.cursorCanvas.width = 0;
    this.exerciseCanvas.height = 0;
  }
}

class NoteDrawInfo {
  constructor(public noteCount: number, public endX: number) {
  }
}