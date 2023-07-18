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
import { videoResolution } from '../videoResolutions';

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

  @Input() videoResolutions: videoResolution[] = [];

  selectedDevice = '';
  selectedResolution = 'default';
  resolutionNotSupported = false;

  notAllowed = false;

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

  async setVideoStream(deviceId: string, resolution: string = 'default') {
    try {
      if (deviceId === '') {
        this.videoTracks = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
      } else {
        if (resolution === 'default') {
          this.videoTracks = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: deviceId } },
          });
        } else {
          for (let videoResolution of this.videoResolutions) {
            if (videoResolution.name === resolution) {
              this.videoTracks = await navigator.mediaDevices.getUserMedia({
                video: {
                  deviceId: { exact: deviceId },
                  height: videoResolution.height,
                  width: videoResolution.width,
                },
              });

              break;
            }
          }
        }
      }

      console.log('set resolution successfully');
      this.resolutionNotSupported = false;
      this.notAllowed = false;
      this.webcamVideo.srcObject = this.videoTracks;
      this.selectedDevice = deviceId;
      this.recordingStop();

      this.gotPermission.emit();
    } catch (error: any) {
      if (error.name === 'OverconstrainedError') {
        this.resolutionNotSupported = true;
        this.notAllowed = false;

        if (this.videoTracks) {
          this.videoTracks.getTracks().forEach((track) => {
            track.stop();
          });
          this.webcamVideo.srcObject = null;
          this.videoTracks = null;
        }

        return;
      } else if (error.name === 'NotAllowedError') {
        this.notAllowed = true;
        this.resolutionNotSupported = false;

        if (this.videoTracks) {
          this.videoTracks.getTracks().forEach((track) => {
            track.stop();
          });
          this.webcamVideo.srcObject = null;
          this.videoTracks = null;

          return;
        }
      }
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

  changeResolution(): void {
    console.log('video resolution changed:', this.selectedResolution);

    this.setVideoStream(this.selectedDevice, this.selectedResolution);
  }
}
