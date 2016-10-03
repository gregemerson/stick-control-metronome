import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {ResourceLibrary} from '../../providers/resource-library/resource-library';
import 'rxjs/add/operator/map';

@Injectable()
export class AudioBuffers {
  private audioFileTest = new RegExp("\.(mp3|wav|ogg)", "i");
  private _audioContext: AudioContext;
 // private jsonFileTest = new RegExp("\.json(\?.*)?$", "i");
  //private audioFileTest = new RegExp("\.(mp3|wav|ogg)(\?.*)?$", "i");
  //private base64AudioTest = new RegExp("^data:audio");
  //private jsFileTest = new RegExp("\.js(\?.*)?$", "i");

  // NEED TO DEFINE A DICTIONARY FOR THIS

  private _buffers: {[key: string]: AudioBuffer} = null;
  private data: any;
  private sources: Array<Source> = new Array<Source>();
  constructor(private http: Http, private resourceLibrary: ResourceLibrary) {
  }

  get buffers() : {[key: string]: AudioBuffer} {
    return this._buffers;
  }

  get audioContext() : AudioContext {
    return this._audioContext;
  }

  get silence() : AudioBuffer {
    return this._buffers['silence'];
  }
  
  private init(audioContext: AudioContext) {
    this._audioContext = audioContext;
    let rate = audioContext.sampleRate;
    // Audio Files
    this.sources[SourceType.AudioFile.toString()] = new Source(
      SourceType.AudioFile,
      'arraybuffer', (name: string, rawData: ArrayBuffer) => 
        this.createFromAudioFile(name, rawData)
    );
  }

  private createFromAudioFile(name: string, rawData: ArrayBuffer) {
    this._audioContext.decodeAudioData(rawData, 
      (buffer) => this._buffers[name] = buffer, 
      () => {throw new Error('Could not decode ' + name);});
  }

  public loadAll(libraryUrl: string, audioContext: AudioContext) {
    if (this._buffers != null) {
      return Promise.resolve();
    }
    this._buffers = {}; 
    this.init(audioContext);
    return this.resourceLibrary.load().then((library) => {
      let urls: Array<[string, string]> = new Array<[string, string]>();
      let items: Object [] = library['sc-group']['sc-audio']['items']; 
      for (let i = 0; i < items.length; i++) {
        urls.push(<[string, string]>[items[i]['name'], items[i]['location']]);
      }
      return Promise.resolve(urls);
    }).then((array) => {
      let promises: Array<Promise<any>> = [];
      this.load(array, promises);
      return Promise.all(promises);
    }).then((value) => {
      return Promise.resolve();
    });
  }

  private load(sources: Array<[string, string]>, promises: Array<Promise<any>>): void{
    // Not sure what to do with the name
    if (sources.length == 0) {
      return;
    }
    let type: SourceType = null;
    let nameAndUrl = sources.pop();
    let name: string = nameAndUrl[0];
    let url: string = nameAndUrl[1];
    if (this.audioFileTest.test(url)) {
      type = SourceType.AudioFile;
    }
    /*
    if (this.jsonFileTest.test(url)) {

    }
    if (this.jsFileTest.test(url)) {
      
    }
    if (this.base64AudioTest.test(url)) {
      
    }
    */
    if (type == null) {
      throw new Error('Invalid file type: ' + url);
    }
    promises.push(this.fetch(name, url, this.sources[type.toString()], sources, promises));
  }

  private fetch(name: string, url: string, type: Source, 
    sources: Array<[string, string]>, promises:Array<Promise<any>>) : Promise<any> {
    // this.http.get()
    this.load(sources, promises);
    return new Promise<any>((resolve, reject) => {
      var req = new XMLHttpRequest();
      if (type) {
        req.responseType = type.responseType;
      } 
      req.open('GET', url)
      req.onload = () => {
        if (req.status == 200) {
          type.bufferCreator(name, req.response);
          resolve('ok');
        }
        else {
          reject(Error(req.statusText));
        }
      }
      req.onerror = () => { reject(Error('Network Error')); }
      req.send();
    });
    
  }

  /*
  // Try to apply a prefix to a name
  private prefix(pre, name) {
    return typeof pre === 'string' ? pre + name
      : typeof pre === 'function' ? pre(name)
        : name
  }

  private loadJsonFile(name, options) : Promise<string> {
    let url = this.prefix(options.from, name);
    return this.load(this.load.fetch(url, 'text').then(JSON.parse), options);
  }

  // BASE64 ENCODED FORMATS
  // ======================

  // Load strings with Base64 encoded audio
  var isBase64Audio = this.fromRegex(/^data:audio/)
  function loadBase64Audio(source, options) {
    var i = source.indexOf(',')
    return load(base64.decode(source.slice(i + 1)).buffer, options)
  }

  function loadMidiJSFile(ac, name, options) {
    var url = prefix(options.from, name)
    return load(ac, load.fetch(url, 'text').then(midiJsToJson), options)
  }

  // convert a MIDI.js javascript soundfont file to json
  function midiJsToJson(data) {
    var begin = data.indexOf('MIDI.Soundfont.')
    if (begin < 0) throw Error('Invalid MIDI.js Soundfont format')
    begin = data.indexOf('=', begin) + 2
    var end = data.lastIndexOf(',')
    return JSON.parse(data.slice(begin, end) + '}')
  }
  */
}

class Base64 {

  // DECODE UTILITIES
  b64ToUint6 (nChr) {
    return nChr > 64 && nChr < 91 ? nChr - 65
      : nChr > 96 && nChr < 123 ? nChr - 71
      : nChr > 47 && nChr < 58 ? nChr + 4
      : nChr === 43 ? 62
      : nChr === 47 ? 63
      : 0
  }

  // Decode Base64 to Uint8Array
  // ---------------------------
  decode (sBase64, nBlocksSize) {
    var sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, '')
    var nInLen = sB64Enc.length
    var nOutLen = nBlocksSize
      ? Math.ceil((nInLen * 3 + 1 >> 2) / nBlocksSize) * nBlocksSize
      : nInLen * 3 + 1 >> 2
    var taBytes = new Uint8Array(nOutLen)

    for (var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
      nMod4 = nInIdx & 3
      nUint24 |= this.b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 18 - 6 * nMod4
      if (nMod4 === 3 || nInLen - nInIdx === 1) {
        for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
          taBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255
        }
        nUint24 = 0
      }
    }
    return taBytes
  }
}

enum SourceType {
  AudioFile
}

class Source {
  constructor(public type: SourceType, public responseType: string, 
    public bufferCreator: (name: string, rawData: ArrayBuffer) => void) {
  }
}