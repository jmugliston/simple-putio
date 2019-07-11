import {AfterViewInit, Component, OnInit} from '@angular/core';
import {ApiService} from '../api/api.service';
import * as _ from '../../../node_modules/lodash';
import { ClipboardService } from 'ngx-clipboard';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {MoveFileModalComponent} from '../move-file-modal/move-file-modal.component';
import {AddFolderModalComponent} from '../add-folder-modal/add-folder-modal.component';

declare var chrome;

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.css']
})
export class FilesComponent implements OnInit {

  files = [];
  breadcrumbs = [];
  loading = false;
  downloadLoading = '';
  filesChecked = [];
  checkAll = false;

  constructor(private apiService: ApiService, private clipboardService: ClipboardService, private modalService: NgbModal) { }

  ngOnInit() {
    this.getFileList(null);
    setInterval(() => {
      this.getFileList(this.getCurrentFolder().id);
    }, 3000);
  }

  checkFile(file) {
    if (this.filesChecked.indexOf(file.id) !== -1) {
      this.filesChecked.splice(this.filesChecked.indexOf(file.id), 1);
      this.checkAll = false;
    } else {
      this.filesChecked.push(file.id);
    }
  }

  checkAllFiles() {
    this.checkAll = !this.checkAll;
    this.filesChecked = this.checkAll ? _.map(this.files, 'id') : [];
  }

  goUpLevel() {
    if (this.breadcrumbs.length > 1) {
      this.getFileList(this.breadcrumbs[this.breadcrumbs.length - 2].id);
      this.breadcrumbs.splice(this.breadcrumbs.length - 1, 1);
    } else {
      // go to root
      this.getFileList(null);
      this.breadcrumbs = [];
    }
  }

  getCurrentFolder() {
    const currentFolder = this.breadcrumbs[this.breadcrumbs.length - 1];
    return currentFolder ? currentFolder : { id: '0', name: 'Your Files'};
  }

  openFolder(folder) {
    this.filesChecked = [];
    this.breadcrumbs.push(folder);
    this.getFileList(folder.id);
  }

  getFileList(id) {

    this.apiService.listFiles(id)
      .subscribe((res) => {
        this.loading = false;
        this.files = res['files'];
      }, (err) => {
        console.error(err);
        this.loading = false;
      });

  }

  fileDownload(file) {
    if (file.file_type === 'FOLDER') {
      this.downloadLoading = file.id;
      // create a zip of the folder
      this.apiService.createZip([file.id])
        .subscribe((res) => {
          // check to see if it's ready every 1s
          const checkZip = setInterval(() => {
            this.apiService.checkZip(res['zip_id'])
              .subscribe((zipRes) => {
                // if zip is done - open download window
                if (zipRes['zip_status'] === 'DONE') {
                  this.downloadLoading = '';
                  chrome.downloads.download({
                    url: zipRes['url']
                  });
                  clearInterval(checkZip);
                }
              });
          }, 1000);
      });
    } else {
      this.apiService.getDownload(file.id);
    }
  }

  deleteSelected() {
    if (this.filesChecked.length > 0) {
      this.apiService.deleteFiles(this.filesChecked)
        .subscribe((res) => {
            this.filesChecked = [];
            this.getFileList(this.getCurrentFolder().id);
          },
          (err) => {
            console.error(err);
          });
    }
  }

  zipSelected() {
    if (this.filesChecked.length > 0) {
      // create a zip of the folder
      this.apiService.createZip(this.filesChecked)
        .subscribe((res) => {
          // poll for status of zip
          const checkZip = setInterval(() => {
            this.apiService.checkZip(res['zip_id'])
              .subscribe((zipRes) => {
                // if zip is done - open download window
                if (zipRes['zip_status'] === 'DONE') {
                  this.downloadLoading = '';
                  chrome.downloads.download({
                    url: zipRes['url']
                  });
                  clearInterval(checkZip);
                }
              });
          }, 1000);
        });
    }
  }

  copyDownloadLink() {
    if (this.filesChecked.length > 0) {
      this.clipboardService.copyFromContent(this.apiService.getDownloadLink(this.filesChecked));
    }
  }

  openFileMoveModal() {

    const modalRef = this.modalService.open(MoveFileModalComponent);
    modalRef.componentInstance.filesToMove = this.filesChecked;

    modalRef.result
      .then((folderId) => {
        this.apiService.moveFiles(this.filesChecked, folderId)
          .subscribe(() => this.getFileList(this.getCurrentFolder().id), err => console.error(err));
        this.filesChecked = [];
        this.checkAll = false;
      }).catch(() => {
        // modal dismissed
      });

  }

  openAddFolderModal() {
    const modalRef = this.modalService.open(AddFolderModalComponent);
    modalRef.result
      .then((name) => {
        // add folder
        this.apiService.addFolder(name, this.getCurrentFolder().id).subscribe(() => {
          this.getFileList(this.getCurrentFolder().id);
        });
      }).catch(() => {
        // modal dismissed
      });
  }

}
