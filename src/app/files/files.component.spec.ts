import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesComponent } from './files.component';
import {FileSizePipe} from '../file-size.pipe';
import {HttpClient, HttpHandler} from '@angular/common/http';
import {ClipboardService} from 'ngx-clipboard';

describe('FilesComponent', () => {
  let component: FilesComponent;
  let fixture: ComponentFixture<FilesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilesComponent, FileSizePipe ],
      providers: [ HttpClient, HttpHandler, ClipboardService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
