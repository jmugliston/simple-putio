import { Component, OnInit } from '@angular/core';
import {ApiService} from '../api/api.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  accountInfo = null;

  constructor(private apiService: ApiService) {}

  ngOnInit() {

    this.apiService.getAccountInfoFeed()
      .subscribe((info) => {
        this.accountInfo = info;
      });

  }


}
