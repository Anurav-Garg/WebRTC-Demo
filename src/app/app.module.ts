import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { VideoPageComponent } from './video-page/video-page.component';
import { AudioPageComponent } from './audio-page/audio-page.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [AppComponent, VideoPageComponent, AudioPageComponent],
  imports: [BrowserModule, FormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
