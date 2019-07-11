import { Component, OnInit } from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-add-folder-modal',
  templateUrl: './add-folder-modal.component.html',
  styleUrls: ['./add-folder-modal.component.scss']
})
export class AddFolderModalComponent implements OnInit {

  public folderName = '';

  constructor(public activeModal: NgbActiveModal) {

  }

  ngOnInit() {
  }

  submit() {
    this.activeModal.close(this.folderName);
  }

}
