import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, of} from 'rxjs';
import {environment} from '../../environments/environment';
declare var chrome;

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  token = null;
  auth = false;

  initSource = new BehaviorSubject<boolean>(false);
  init$ = this.initSource.asObservable();

  authSource = new BehaviorSubject<boolean>(false);
  auth$ = this.authSource.asObservable();

  transfersSource = new BehaviorSubject<any>(false);
  transfers$ = this.transfersSource.asObservable();

  accountInfoSource = new BehaviorSubject<any>(false);
  accountInfo$ = this.accountInfoSource.asObservable();

  constructor(private http: HttpClient) {

    this.getToken(() => {

      this.initSource.next(true);

      // check transfers and account info if we have auth
      if (this.auth) {

        this.getTransfers()
          .subscribe((res) => {
            const transfers = res['transfers'];
            this.transfersSource.next(transfers);
          });

        this.getAccountInfo().subscribe((info) => {
          this.accountInfoSource.next(info);
        });

      }

    });

    // set interval to check transfers / account info
    setInterval(() => {

      if (this.auth) {

        this.getTransfers()
          .subscribe((res) => {
            const transfers = res['transfers'];
            this.transfersSource.next(transfers);
          });

        this.getAccountInfo().subscribe((info) => {
          this.accountInfoSource.next(info);
        });

      }

    }, 1000);

  }

  getInitFeed() {
    return this.init$;
  }

  getAuthFeed() {
    return this.auth$;
  }

  getTranfersFeed() {
    return this.transfers$;
  }

  getAccountInfoFeed() {
    return this.accountInfo$;
  }

  getAuth(cb) {

    chrome.identity.launchWebAuthFlow(
      {
        // tslint:disable-next-line:max-line-length
        url: `${environment.apiHost}/v2/oauth2/authenticate?client_id=3652&response_type=token&redirect_uri=https://${chrome.runtime.id}.chromiumapp.org/oauth`,
        interactive: true
      }, (redirectURL) => {

        if (redirectURL) {

          const accessToken = redirectURL.split('=')[1];

          chrome.storage.sync.set({'accessToken': accessToken}, () => {
            this.token = accessToken;
            this.auth = true;
            this.authSource.next(true);
            return cb();
          });

          chrome.extension.getBackgroundPage().checkAuth();

        } else {
          return cb();
        }

      });

  }

  getToken(cb) {

    if (environment.production === false) {

      this.token = environment.token;
      this.auth = true;
      this.authSource.next(true);
      return cb();

    } else if (chrome.extension.getBackgroundPage() && chrome.extension.getBackgroundPage().getApiToken() !== null) {

      this.token = chrome.extension.getBackgroundPage().apiToken;
      this.auth = true;
      this.authSource.next(true);
      return cb();

    } else {

      chrome.storage.sync.get(['accessToken'], (item) => {

        if (item && item.accessToken) {
          this.token = item.accessToken;
          this.auth = true;
          this.authSource.next(true);
        }

        return cb();

      });

    }

  }

  listFiles(parentId) {

    const options = {
      params: {},
      headers: null,
      withCredentials: true
    };

    options.params = parentId ? { parent_id: parentId } : {};

    if (this.token) {
      return this.http.get(`${environment.apiHost}/v2/files/list?oauth_token=${this.token}`, options);
    }

    return of({ files: [] });

  }

  getFileInfo(id) {

    const options = {
      params: {},
      headers: null,
      withCredentials: true
    };

    if (this.token) {
      return this.http.get(`${environment.apiHost}/v2/files/${id}?oauth_token=${this.token}`, options);
    }
    return of([]);

  }

  deleteFiles(ids) {
    return this.http.post(`${environment.apiHost}/v2/files/delete?oauth_token=${this.token}`, {
      file_ids: ids.join(','),
    });
  }

  getTransfers() {
    return this.http.get(`${environment.apiHost}/v2/transfers/list?oauth_token=${this.token}`);
  }

  getAccountInfo() {
    return this.http.get(`${environment.apiHost}/v2/account/info?oauth_token=${this.token}`);
  }

  addFolder(name, parentId) {
    return this.http.post(`${environment.apiHost}/v2/files/create-folder?oauth_token=${this.token}`, {
      name,
      parent_id: parentId,
    });
  }

  moveFiles(ids, parentId) {
    return this.http.post(`${environment.apiHost}/v2/files/move?oauth_token=${this.token}`, {
      file_ids: ids.join(','),
      parent_id: parentId,
    });
  }

  getDownload(id) {
    chrome.downloads.download({
      url: `https://api.put.io/v2/files/${id}/download?oauth_token=${this.token}`
    });
  }

  getDownloadLink(ids) {
    let links = '';
    ids.forEach((id) => {
      links += `https://api.put.io/v2/files/${id}/download?oauth_token=${this.token}`;
    });
    return links;
  }

  createZip(ids) {
    return this.http.post(`${environment.apiHost}/v2/zips/create?oauth_token=${this.token}`, {
      file_ids: ids.join(','),
    });
  }

  checkZip(id) {
    return this.http.get(`${environment.apiHost}/v2/zips/${id}?oauth_token=${this.token}`);
  }

  addTransfer(url) {
    return this.http.post(`${environment.apiHost}/v2/transfers/add?oauth_token=${this.token}`, { url });
  }

  cleanTransfers() {
    return this.http.post(`${environment.apiHost}/v2/transfers/clean?oauth_token=${this.token}`, null);
  }


}
