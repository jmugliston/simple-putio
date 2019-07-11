import {Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {ApiService} from '../api/api.service';
import * as _ from '../../../node_modules/lodash';

@Component({
  selector: 'app-move-file-modal',
  templateUrl: './move-file-modal.component.html',
  styleUrls: ['./move-file-modal.component.css']
})
export class MoveFileModalComponent implements OnInit {

  @Input() filesToMove = [];
  currentFolderId = '0';
  folderList = [];
  breadcrumbs = [];
  loading = false;

  constructor(public activeModal: NgbActiveModal, private apiService: ApiService) { }

  ngOnInit() {
    this.getFileList(null);
  }

  goToFolder(folder?) {
    if (folder) {
      const folderIndex = this.breadcrumbs.indexOf(folder);
      this.breadcrumbs.splice(folderIndex, this.breadcrumbs.length - folderIndex);
      this.openFolder(folder);
    } else {
      this.breadcrumbs = [];
      this.getFileList(null);
    }
    this.updateCurrentFolder();
  }

  openFolder(folder) {
    this.breadcrumbs.push(folder);
    this.getFileList(folder.id);
    this.updateCurrentFolder();
  }

  getFileList(id) {

    this.loading = true;
    this.apiService.listFiles(id)
      .subscribe((res) => {
        this.folderList = _.filter(res['files'], { file_type: 'FOLDER'});
        this.loading = false;
      }, (err) => {
        console.error(err);
        this.loading = false;
      });

  }

  updateCurrentFolder() {
    if (this.breadcrumbs.length > 0) {
      this.currentFolderId = this.breadcrumbs[this.breadcrumbs.length - 1].id;
    } else {
      this.currentFolderId = '0';
    }
  }

  canMoveToThisFolder(folderId) {
    return this.filesToMove.indexOf(folderId) === -1;
  }

}
