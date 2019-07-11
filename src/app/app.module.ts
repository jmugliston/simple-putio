import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { ClipboardModule } from 'ngx-clipboard';
import { AppComponent } from './app.component';
import {HttpClientModule} from '@angular/common/http';
import { FileSizePipe } from './file-size.pipe';
import { FooterComponent } from './footer/footer.component';
import { FilesComponent } from './files/files.component';
import { TransfersComponent } from './transfers/transfers.component';
import { MomentModule } from 'ngx-moment';
import {RouterModule, Routes} from '@angular/router';
import {FormsModule} from '@angular/forms';
import { ClickStopPropagationDirective } from './click-stop-propagation.directive';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { MoveFileModalComponent } from './move-file-modal/move-file-modal.component';
import { AddFolderModalComponent } from './add-folder-modal/add-folder-modal.component';

const appRoutes: Routes = [
  { path: 'files', component: FilesComponent },
  { path: 'transfers', component: TransfersComponent },
  { path: '',
    redirectTo: '/files',
    pathMatch: 'full'
  }
];

@NgModule({
  declarations: [
    AppComponent,
    FileSizePipe,
    FooterComponent,
    FilesComponent,
    TransfersComponent,
    ClickStopPropagationDirective,
    MoveFileModalComponent,
    AddFolderModalComponent
  ],
  imports: [
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: false } // <-- debugging purposes only
    ),
    BrowserModule,
    NgbModule,
    NgbCollapseModule,
    HttpClientModule,
    MomentModule,
    FormsModule,
    ClipboardModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [AddFolderModalComponent, MoveFileModalComponent]
})
export class AppModule { }
