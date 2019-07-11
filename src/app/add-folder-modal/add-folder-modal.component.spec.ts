import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFolderModalComponent } from './add-folder-modal.component';
import { FormsModule } from '@angular/forms';
import {NgbActiveModal, NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {HttpClient} from '@angular/common/http';
import {FileSizePipe} from '../file-size.pipe';

describe('AddFolderModalComponent', () => {
  let component: AddFolderModalComponent;
  let fixture: ComponentFixture<AddFolderModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddFolderModalComponent, FileSizePipe ],
      providers: [ NgbActiveModal ],
      imports: [ FormsModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddFolderModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
