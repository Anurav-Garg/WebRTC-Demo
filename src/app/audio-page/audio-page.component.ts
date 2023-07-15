import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-audio-page',
  templateUrl: './audio-page.component.html',
  styleUrls: ['./audio-page.component.css'],
})
export class AudioPageComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('audio') audioRef!: ElementRef;
  micAudio!: HTMLVideoElement;
  audioTracks: MediaStream | null = null;

  @Input() audioDevices: MediaDeviceInfo[] = [];
  @Output() audioDevicesChange = new EventEmitter<MediaDeviceInfo[]>();

  selectedDevice = '';

  @Output() gotPermission = new EventEmitter<void>();

  ngAfterViewInit(): void {
    this.micAudio = this.audioRef.nativeElement;

    if (this.audioDevices.length > 0) {
      this.setAudioStream(this.audioDevices[0].deviceId);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['audioDevices']) {
      console.log('changes:', changes['audioDevices']);

      if (
        this.audioDevices.length > 0 &&
        changes['audioDevices'].previousValue &&
        changes['audioDevices'].previousValue.length === 0
      ) {
        this.setAudioStream(this.audioDevices[0].deviceId);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.audioTracks) {
      this.audioTracks.getTracks().forEach((track) => {
        track.stop();
      });
    }
  }

  deviceChange(): void {
    console.log('audio device changed:', this.selectedDevice);

    this.setAudioStream(this.selectedDevice);
  }

  async setAudioStream(deviceId: string) {
    try {
      this.audioTracks = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { exact: deviceId } },
      });
      this.micAudio.srcObject = this.audioTracks;
      this.selectedDevice = deviceId;

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
