import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-audio-page',
  templateUrl: './audio-page.component.html',
  styleUrls: ['./audio-page.component.css'],
})
export class AudioPageComponent implements AfterViewInit, OnChanges {
  @ViewChild('audio') audioRef!: ElementRef;
  micAudio!: HTMLVideoElement;

  @Input() audioDevices: MediaDeviceInfo[] = [];
  @Output() audioDevicesChange = new EventEmitter<MediaDeviceInfo[]>();

  @Output() gotPermission = new EventEmitter<void>();

  async ngAfterViewInit() {
    this.micAudio = this.audioRef.nativeElement;

    if (this.audioDevices.length > 0) {
      this.setAudioStream();
    }
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (changes['audioDevices']) {
      console.log('changes:', changes['audioDevices']);

      if (
        this.audioDevices.length > 0 &&
        changes['audioDevices'].previousValue &&
        changes['audioDevices'].previousValue.length === 0
      ) {
        this.setAudioStream();
      }
    }
  }

  async setAudioStream() {
    try {
      this.micAudio.srcObject = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { exact: this.audioDevices[0].deviceId } },
      });

      this.gotPermission.emit();
    } catch (error: any) {
      console.log(
        'error while setting audio stream:',
        error.name,
        error.message
      );
    }
  }
}
