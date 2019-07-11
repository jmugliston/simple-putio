import {Component, OnInit} from '@angular/core';
import {ApiService} from '../api/api.service';
import * as _ from '../../../node_modules/lodash';

declare var chrome;

@Component({
  selector: 'app-transfers',
  templateUrl: './transfers.component.html',
  styleUrls: ['./transfers.component.css']
})
export class TransfersComponent implements OnInit {

  transfers = [];

  constructor(private apiService: ApiService) { }

  ngOnInit() {

    this.apiService.getTranfersFeed().subscribe((transfers: any) => {
      if (transfers) {
        this.transfers = _.orderBy(transfers, (transfer) => {
          if (!transfer.finished_at) {
            return new Date();
          }
          return new Date(transfer.finished_at);
        }, 'desc');
      }
    });

  }

}
