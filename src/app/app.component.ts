import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'webrtcDemo';

  onVideoPage = true;
  videoNotAllowed = false;
  audioNotAllowed = false;
  videoDevices: MediaDeviceInfo[] = [];
  audioDevices: MediaDeviceInfo[] = [];

  async ngOnInit() {
    this.updateDevices();
  }

  async updateDevices() {
    try {
      const mediaDevices = await navigator.mediaDevices.enumerateDevices();

      const tempVideoDevices: MediaDeviceInfo[] = [];
      const tempAudioDevices: MediaDeviceInfo[] = [];

      for (let mediaDevice of mediaDevices) {
        if (mediaDevice.kind === 'videoinput') {
          tempVideoDevices.push(mediaDevice);
        } else if (mediaDevice.kind === 'audioinput') {
          tempAudioDevices.push(mediaDevice);
        }

        this.videoDevices = tempVideoDevices;
        this.audioDevices = tempAudioDevices;

        console.log('Updated devices:', this.videoDevices, this.audioDevices);
      }
    } catch (error: any) {
      if (error.name === 'NotAllowedError') {
        this.videoNotAllowed = true;
      } else {
        console.log('Error getting user devices:', error.name, error.message);
      }
    }
  }

  togglePage(): void {
    console.log('Toggling page');

    this.onVideoPage = !this.onVideoPage;
  }
}
