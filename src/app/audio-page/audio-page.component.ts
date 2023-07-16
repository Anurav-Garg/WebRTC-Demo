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
  @ViewChild('recordedAudio') recordedAudioRef!: ElementRef;
  micAudio!: HTMLVideoElement;
  recordedAudio!: HTMLVideoElement;
  audioTracks: MediaStream | null = null;

  recordedBlobs: Blob[] = [];
  recorder: MediaRecorder | null = null;
  recording = false;

  @Input() audioDevices: MediaDeviceInfo[] = [];
  @Output() audioDevicesChange = new EventEmitter<MediaDeviceInfo[]>();

  selectedDevice = '';

  @Output() gotPermission = new EventEmitter<void>();

  ngAfterViewInit(): void {
    this.micAudio = this.audioRef.nativeElement;
    this.recordedAudio = this.recordedAudioRef.nativeElement;

    if (this.audioDevices.length > 0) {
      this.setAudioStream(this.audioDevices[0].deviceId);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['audioDevices']) {
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
    if (deviceId === '') {
      try {
        console.log('here');

        this.audioTracks = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            autoGainControl: false,
            noiseSuppression: false,
          },
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
      return;
    }

    try {
      this.audioTracks = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: { exact: deviceId },
          echoCancellation: false,
          autoGainControl: false,
          noiseSuppression: false,
        },
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

  recordingStart(): void {
    this.recordedBlobs = [];
    if (this.audioTracks === null) {
      // TODO: error about permissions
      return;
    }

    try {
      this.recorder = new MediaRecorder(this.audioTracks, {
        mimeType: 'audio/ogg',
      });
    } catch (error: any) {
      console.log('error while starting recorder:', error.name, error.message);
      return;
    }

    this.recorder.start();
    this.recording = true;
    this.recorder.ondataavailable = (event: any) => {
      if (event.data && event.data.size > 0) {
        this.recordedBlobs.push(event.data);
      }
    };
    this.recorder.onstop = (event: any) => {
      const audioBuffer = new Blob(this.recordedBlobs, {
        type: 'audio/ogg',
      });

      this.recordedAudio.src = window.URL.createObjectURL(audioBuffer);
    };
  }

  recordingStop(): void {
    this.recording = false;
    this.recorder?.stop();
  }
}
