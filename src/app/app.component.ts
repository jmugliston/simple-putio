import {Component, OnInit} from '@angular/core';
import {ApiService} from './api/api.service';
import {NavigationEnd, Router} from '@angular/router';
import { filter } from 'rxjs/operators';
declare var chrome;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  init = false;
  auth = false;
  activeTab = 'files';
  router;
  cleanTranfersInProgress = false;

  constructor(private apiService: ApiService, router: Router) {
    this.router = router;
    setInterval(() => {
      // Todo: find out why I need this!
      // force a refresh in the view every second
    }, 1000);
  }

  ngOnInit() {

    if (chrome.extension) {
      if (chrome.extension.getBackgroundPage() && chrome.extension.getBackgroundPage().getActiveTab()) {
        this.router.navigateByUrl('/' + chrome.extension.getBackgroundPage().getActiveTab());
      } else {
        this.router.navigateByUrl('/files');
      }
    }

    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e) => {
      this.activeTab = e.url.substring(1);
      if (chrome.extension && chrome.extension.getBackgroundPage()) {
        chrome.extension.getBackgroundPage().setActiveTab(this.activeTab);
      }
    });

    // update when finished init
    this.apiService.getInitFeed()
      .subscribe((init) => {
        if (init) {
          this.init = true;
        }
      });

    // update if user has auth
    this.apiService.getAuthFeed()
      .subscribe((auth) => {
        if (auth) {
          this.auth = true;
        }
      });

  }

  getAuth() {
    this.apiService.getAuth(() => {});
  }

  cleanTransfers() {
    this.cleanTranfersInProgress = true;
    this.apiService.cleanTransfers()
      .subscribe(() => {
        this.cleanTranfersInProgress = false;
        if (chrome.extension && chrome.extension.getBackgroundPage()) {
          chrome.extension.getBackgroundPage().getTransfers();
        }
      }, (err) => {
        console.error(err);
        this.cleanTranfersInProgress = false;
      });
  }

}
