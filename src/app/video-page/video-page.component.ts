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
  selector: 'app-video-page',
  templateUrl: './video-page.component.html',
  styleUrls: ['./video-page.component.css'],
})
export class VideoPageComponent implements AfterViewInit, OnChanges {
  @ViewChild('video') videoRef!: ElementRef;
  webcamVideo!: HTMLVideoElement;

  @Input() videoDevices: MediaDeviceInfo[] = [];
  @Output() videoDevicesChange = new EventEmitter<MediaDeviceInfo[]>();

  @Output() gotPermission = new EventEmitter<void>();

  async ngAfterViewInit() {
    this.webcamVideo = this.videoRef.nativeElement;

    if (this.videoDevices.length > 0) {
      this.setVideoStream();
    }
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (changes['videoDevices']) {
      console.log('changes:', changes['videoDevices']);

      if (
        this.videoDevices.length > 0 &&
        changes['videoDevices'].previousValue &&
        changes['videoDevices'].previousValue.length === 0
      ) {
        this.setVideoStream();
      }
    }
  }

  async setVideoStream() {
    try {
      this.webcamVideo.srcObject = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: this.videoDevices[0].deviceId } },
      });

      this.gotPermission.emit();
    } catch (error: any) {
      console.log(
        'error while setting video stream:',
        error.name,
        error.message
      );
    }
  }
}
