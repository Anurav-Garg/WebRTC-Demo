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
  selector: 'app-video-page',
  templateUrl: './video-page.component.html',
  styleUrls: ['./video-page.component.css'],
})
export class VideoPageComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('video') videoRef!: ElementRef;
  @ViewChild('recordedVideo') recordedVideoRef!: ElementRef;
  webcamVideo!: HTMLVideoElement;
  recordedVideo!: HTMLVideoElement;
  videoTracks: MediaStream | null = null;

  recordedBlobs: Blob[] = [];
  recorder: MediaRecorder | null = null;
  recording = false;

  @Input() videoDevices: MediaDeviceInfo[] = [];
  @Output() videoDevicesChange = new EventEmitter<MediaDeviceInfo[]>();

  selectedDevice = '';

  @Output() gotPermission = new EventEmitter<void>();

  ngAfterViewInit(): void {
    this.webcamVideo = this.videoRef.nativeElement;
    this.recordedVideo = this.recordedVideoRef.nativeElement;

    if (this.videoDevices.length > 0) {
      this.setVideoStream(this.videoDevices[0].deviceId);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['videoDevices']) {
      if (
        this.videoDevices.length > 0 &&
        changes['videoDevices'].previousValue &&
        changes['videoDevices'].previousValue.length === 0
      ) {
        this.setVideoStream(this.videoDevices[0].deviceId);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.videoTracks) {
      this.videoTracks.getTracks().forEach((track) => {
        track.stop();
      });
    }
  }

  deviceChange(): void {
    console.log('video device changed:', this.selectedDevice);

    this.setVideoStream(this.selectedDevice);
  }

  async setVideoStream(deviceId: string) {
    try {
      this.videoTracks = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } },
      });
      this.webcamVideo.srcObject = this.videoTracks;
      this.selectedDevice = deviceId;

      this.gotPermission.emit();
    } catch (error: any) {
      console.log(
        'error while setting video stream:',
        error.name,
        error.message
      );
    }
  }

  recordingStart(): void {
    this.recordedBlobs = [];
    if (this.videoTracks === null) {
      // TODO: error about permissions
      return;
    }

    try {
      this.recorder = new MediaRecorder(this.videoTracks, {
        mimeType: 'video/webm',
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
      const videoBuffer = new Blob(this.recordedBlobs, {
        type: 'video/webm',
      });

      this.recordedVideo.src = window.URL.createObjectURL(videoBuffer);
    };
  }

  recordingStop(): void {
    this.recording = false;
    this.recorder?.stop();
  }
}
