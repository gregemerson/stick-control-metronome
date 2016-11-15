import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController } from 'ionic-angular';
import * as ES from '../../providers/exercise-sets/exercise-sets';

@Component({
  selector: 'exercise-display',
  styles: [
    `.exercise-canvas {
        z-index: 2;
        border-style: solid;
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
  private noteBottomSpacing: number;
  private noteTopSpacing: number;

  // Define the horzontal placements of note
  private noteX: number;
  private cursorWidth = 2;
  private defaultLineWidth = -1;

  private _exerciseContext: CanvasRenderingContext2D = null;
  private _cursorContext: CanvasRenderingContext2D = null;
  private exerciseCanvas: HTMLCanvasElement;
  private cursorCanvas: HTMLCanvasElement;

  private endOfLineIndices = new Array<number>();
  private selectedFontSize: number;
  private container: ElementRef;
  private noteWidths: number[];
  private genericNote = 'X';
  private graceColor = '#FF0000';
  private buzzColor = '#3F9FBF';
  private restFillColor = '#e6e9ef';

  constructor(private navCtrl: NavController) {
  }

  private setNoteEndPosition(note = this.genericNote): number {
    let widths = this.noteWidths;
    let lastWidth = (widths.length == 0) ? 0 : widths[widths.length - 1];
    let width = note == '' ? 0 : this.getTotalNoteWidth(note);
    this.noteWidths.push(lastWidth + width);
    return width;
  }

  private getTotalNoteWidth(note = this.genericNote): number {
    return this.getNoteWidth(note) + this.noteSpacing;
  }

  private getNoteWidth(note = this.genericNote): number {
    this.setNoteFont();
    return Math.ceil(this.getExerciseContext().
      measureText(note).width);
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
      this.defaultLineWidth = this._exerciseContext.lineWidth;
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
    this.setupRegions();
    let widthIndexOffset = 0;
    for (let endOfLine of this.endOfLineIndices) {
      if (position > endOfLine + 1)  {
        this.moveNextLine();
        widthIndexOffset++;
      }
      else {
        break;
      }
    }
    this.clearCanvas(this.cursorCanvas);
    let context = this.getCursorContext();
    let x = this.noteWidths[position + widthIndexOffset] - this.noteSpacing/2;
    let y = this.topPaddingY;
    context.lineWidth = this.cursorWidth;
    context.beginPath();
    context.moveTo(x, y);
    y = this.letterY;
    context.lineTo(x, y);
    context.stroke();
    context.closePath();
  }

  hideCursor() {
    this.clearCanvas(this.cursorCanvas);
  }

  private clearCanvas(canvas: HTMLCanvasElement) {
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  }

  // Make sure that 1/2 of the spacing is an integer
  private get noteSpacing(): number {
    this.setNoteFont();
    let lower = Math.ceil(0.25 * this.getExerciseContext().
      measureText(this.genericNote).width);
    return (lower%2 == 0) ? lower : lower + 1;
  }

  private setNoteFont() {
    this.getExerciseContext().font = this.
      selectedFontSize.toString() + this.exerciseFont;
  }

  private drawNoteFont(note = '', x = -1, y =  -1, 
    textColor = 'rgba(0, 0, 0, 1)', baseLine = 'bottom') {
    this.setNoteFont();
    let context = this.getExerciseContext();
    context.strokeStyle = textColor;
    context.lineWidth = this.defaultLineWidth;
    context.textBaseline = baseLine;
    context.fillRect
    if (note != '') {
      context.strokeText(note, x, y);
    }
  }

  private setFontVerticalSpacing() {
    this.clearCanvas(this.exerciseCanvas);
    let width = this.getNoteWidth('R');
    let height = this.selectedFontSize;
    let ctx = this.getExerciseContext();
    ctx.fillStyle = 'rgba(200, 0, 0, .8)';
    ctx.fillRect(0, 0, width, height);
    this.drawNoteFont('R', 0, height, 'rgba(0, 0, 0, 1)');
    let imageData = ctx.getImageData(0, 0, width, height).data;
    let upper = 0;
    let lower = 0;
    let middle = 0;
    let rowLength = 4 * width;
    for (let row = 0; row < height; row++) {
      // Scan row
      let hasNote = false;
      for (let column = 0; column < width; column++) {
        if (imageData[(4 * column) + (row * rowLength)] == 0) {
          hasNote = true;
          break;
        }
      }
      if (hasNote) {
        middle++;
      }
      else {
        upper += middle == 0 ? 1 : 0;
        lower += middle != 0 ? 1 : 0;
      }
    }
    this.noteTopSpacing = upper - 1;
    this.noteBottomSpacing = lower + 3;
    this.clearCanvas(this.exerciseCanvas);
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
    this.noteWidths = [];
    this.setFontVerticalSpacing();
    for (let lineIdx = 0; lineIdx < this.endOfLineIndices.length; lineIdx++) {
      this.noteWidths.push(this.noteSpacing);
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
          this.noteX += this.drawGroupSeparator(firstWrite);
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
    this.selectedFontSize = fontSize;
    let noteWidth: number;
    let longestGroupLength = exercise.display.longestStrokeGroup();
    // Guarantee that the longest stroke group will fit within a line
    while (true) {
      this.setNoteFont();
      noteWidth = this.getTotalNoteWidth();
      let currentWidthNeeded = (longestGroupLength * noteWidth) + this.noteSpacing;
      if (currentWidthNeeded <= this.exerciseCanvas.width) {
        break;
      }
      else {
        if (this.selectedFontSize == 0) {
          break;
        }
        this.selectedFontSize--;
      }
    }
    // Now find line breaks which can only be ' ' or '|'
    this.endOfLineIndices.length = 0;
    let usedWidth = 0;
    let breakCandidate = 0;
    let previousBreak = -1;
    let lastNewLine = -1;
    for (let elementIndex = 0; elementIndex < exercise.display.length; elementIndex++) {
      let element = exercise.display.getElement(elementIndex);
      // @todo note type widths should be encapsulated
      let currentWidth = (element instanceof ES.Repeat) ? 2 * noteWidth : noteWidth;
      if ((usedWidth + currentWidth) <= this.exerciseCanvas.width) {
        // See if element can be an eol
        if (!(element instanceof ES.Stroke)) {
          lastNewLine = elementIndex;
        }
        usedWidth += currentWidth;
      }
      else {
        this.endOfLineIndices.push(lastNewLine - 1);
        elementIndex = lastNewLine;
        usedWidth = currentWidth;
      }
    }
    this.endOfLineIndices.push(exercise.display.length - 1);
    this.setupRegions();
  }

  private setupRegions(): void {
    let fontSize = this.selectedFontSize;
    let context = this.getExerciseContext();
    let groupingFontSize = 0.6 * fontSize;
    this.topPaddingY =  0.1 * fontSize;
    this.accentY = this.topPaddingY + (0.2 * fontSize);
    this.accentPaddingY = this.accentY + (0.05 * fontSize);
    this.letterY = this.accentPaddingY + fontSize;
    this.graceNoteY = this.letterY + (0.3 * fontSize);
    this.groupingY = this.graceNoteY + (0.5 * fontSize);
    this.bottomPaddingY = this.groupingY + (0.1 * fontSize);
    this.resetNoteX();
  }

  private resetNoteX() {
    this.noteX = this.noteSpacing;
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
      if (stroke.hand == ES.Encoding.rest) {
        this.drawRest(stroke.hand, x);
      }
      else {
        this.drawNoteFont(stroke.hand, x, this.letterY);
      }
      let endPosition = this.setNoteEndPosition(stroke.hand);
      let noteWidth = this.getNoteWidth(stroke.hand);
      if (stroke.grace != 0) {
        if (stroke.grace == ES.Encoding.buzz) {
          context.lineWidth = regionHeight/2;
          context.strokeStyle = this.buzzColor;
          context.beginPath();
          context.moveTo(x, this.letterY - this.noteBottomSpacing);
          context.lineTo(x + noteWidth, this.letterY - this.noteBottomSpacing);
          context.stroke();
          context.closePath();          
        }
        else {
          context.lineWidth = regionHeight/4;
          context.strokeStyle = this.graceColor;
          context.beginPath();
          for (let i = 0; i < stroke.grace; i++) {
            let y =  this.letterY + (2 * i * context.lineWidth) - this.noteBottomSpacing;
            context.moveTo(x, y);
            context.lineTo(x + noteWidth, y);
          }
          context.stroke();
          context.closePath();
        }
      }
      x += endPosition;
    }
    this.drawGroupLines(x - this.noteX - this.noteSpacing, end - startIndex);
    return  new NoteDrawInfo(end - startIndex, x);
  }

  private drawRepeat(repeat: ES.Repeat): number {
    let endPosition = this.setNoteEndPosition('XX');
    let noteWidth = this.getNoteWidth('XX');
    let startX = this.noteX;
    let endX = startX + noteWidth;
    let halfHeight = (this.groupingY - this.accentPaddingY)/2;
    let verticalCenter = this.groupingY - halfHeight;
    let context = this.getExerciseContext();
    // Draw divider
    context.lineWidth = 0.06 * this.selectedFontSize;
    context.beginPath();
    context.moveTo(startX, verticalCenter);
    context.lineTo(endX, verticalCenter);
    context.stroke();   
    context.closePath();
    // Draw values
    context.font = (0.8 * halfHeight) + this.exerciseFont;
    let top = repeat.numMeasures.toString();
    let bottom = repeat.numRepeats.toString()
    let topWidth = context.measureText(repeat.numMeasures.toString()).width;
    let bottomWidth = context.measureText(repeat.numRepeats.toString()).width;
    let offsetX = (noteWidth - context.measureText(top).width)/2; 
    context.textBaseline = 'top';
    context.strokeText(top, startX + offsetX, this.accentY);
    offsetX = (noteWidth - context.measureText(bottom).width)/2; 
    context.textBaseline = 'bottom';
    context.strokeText(bottom, startX + offsetX, this.letterY);
    return endPosition;
  }

  private drawGroupSeparator(isFirstPositionOnLine = false): number {
    let char = isFirstPositionOnLine ? '' : 'X';
    return this.setNoteEndPosition(char);
  }

  private drawMeasureSeparator(): number {
    let noteWidth = this.getNoteWidth();
    let context = this.getExerciseContext();
    let middleX = this.noteX + (noteWidth/2);
    context.lineWidth = noteWidth * 0.1;
    context.beginPath();
    context.moveTo(middleX, this.accentPaddingY);
    context.lineTo(middleX, this.groupingY);
    context.stroke();
    context.closePath();
    return this.setNoteEndPosition();
  }

  private drawRest(noteChar: string, xPos: number) {
    let context = this.getExerciseContext();
    let restWidth = this.getNoteWidth(noteChar);
    let restHeight =  this.selectedFontSize - 
      this.noteBottomSpacing - this.noteTopSpacing;
    let centerX = xPos + (restWidth/2);
    let centerY = ((this.letterY - this.noteBottomSpacing) + 
      (this.accentPaddingY + this.noteTopSpacing))/2;
    let radius = .8 * Math.min(restWidth/2, restHeight/2);
    context.fillStyle = this.restFillColor;
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fill();
    context.closePath();
  }

  private drawGroupLines(groupWidth: number, numNotes: number) {
    let context = this.getExerciseContext();
    context.textBaseline = 'middle';
    context.strokeStyle = 'black';
    let regionHeight = this.groupingY - this.graceNoteY;
    // Account for notes and note spacing
    let regionWidth = groupWidth;
    context.font = regionHeight + this.exerciseFont; 
    let halfCharWidth = context.measureText(numNotes.toString()).width/2;
    let beginNumX = this.noteX + (regionWidth/2) - halfCharWidth;
    let endNumX = this.noteX + (regionWidth/2) + halfCharWidth;
    let lineY = this.graceNoteY + (regionHeight/2) - this.noteBottomSpacing;
    context.strokeText(numNotes.toString(), beginNumX, lineY);
    context.lineWidth = 0.1 * regionHeight;
    context.beginPath();
    context.moveTo(this.noteX, lineY);
    context.lineTo(beginNumX, lineY);
    context.moveTo(endNumX, lineY);
    context.lineTo(this.noteX + regionWidth, lineY);
    context.stroke();
    context.closePath();
  }

  drawAccent(x: number) {
    let context = this.getExerciseContext();
    let middleY = (this.topPaddingY + this.accentY)/2;
    let accentWidth = .80 * this.getNoteWidth();
    context.lineWidth = .05 * this.selectedFontSize;
    context.beginPath();
    context.strokeStyle = "black";
    context.moveTo(x, this.topPaddingY);
    context.lineTo(x + accentWidth, middleY);
    context.lineTo(x, this.accentY);
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