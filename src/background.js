
// using plain js for background script

var isAuth = false;
var apiUrl = 'https://api.put.io/';
var apiToken = null;
var activeTab = 'files';

chrome.contextMenus.removeAll();

var getApiToken = function() {
  return apiToken;
};

var getActiveTab = function() {
  return activeTab;
};

var setActiveTab = function(tab) {
  activeTab = tab;
};

// check for Put.io authentication before adding context menu
var checkAuth = function() {
  chrome.storage.sync.get('accessToken', (res) => {
    if (res.accessToken) {
      apiToken = res.accessToken;
      isAuth = true;
      addContextMenu();
      getTransfers();
    }
  });
};

var getTransfers = function() {

  if (isAuth) {

    setTimeout(() => {

      var transfersHttp = new XMLHttpRequest();
      transfersHttp.open("GET", apiUrl + 'v2/transfers/list?oauth_token=' + apiToken);
      transfersHttp.onreadystatechange = function () {
        if (transfersHttp.readyState === 4 && transfersHttp.status === 200) {
          var result = JSON.parse(transfersHttp.responseText);
          var completedCount = 0;
          var inProgressCount = 0;
          result.transfers.forEach(function (transfer) {
            if (transfer.status === 'COMPLETED' || transfer.status === 'SEEDING') {
              completedCount += 1;
            } else if (transfer.status === 'IN_QUEUE' || transfer.status === 'DOWNLOADING' || transfer.status === 'COMPLETING') {
              inProgressCount += 1;
            }
          });

          if (completedCount === 0 && inProgressCount === 0) {
            // clear badge
            chrome.browserAction.setBadgeText({text: ''});
          } else if (completedCount > 0) {
            if (inProgressCount > 0) {
              chrome.browserAction.setBadgeBackgroundColor({color: '#ffc107'});
              chrome.browserAction.setBadgeText({text: inProgressCount.toString() + '/' + completedCount.toString()});
            } else {
              chrome.browserAction.setBadgeBackgroundColor({color: '#28a745'});
              chrome.browserAction.setBadgeText({text: completedCount.toString()});
            }
          } else {
            chrome.browserAction.setBadgeBackgroundColor({color: '#ffc107'});
            chrome.browserAction.setBadgeText({text: inProgressCount.toString()});
          }

        }

      };

      transfersHttp.send();

    }, 1000);

  }

};

var addContextMenu = function() {

  // add context menu
  chrome.contextMenus.create({
    title: 'Send to Put.io',
    id: 'parent',
    contexts: ['link', 'selection']
  });

  chrome.contextMenus.onClicked.addListener((data) => {

    let url;

    // get url from selected text
    if (data.selectionText) {
      url = encodeURI(data.selectionText);
    }

    // get url
    if (data.linkUrl) {
      url = data.linkUrl;
    }

    var http = new XMLHttpRequest();
    var params = 'oauth_token=' + apiToken + '&url=' + url;
    http.open('POST', apiUrl + 'v2/transfers/add', true);
    http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    http.onreadystatechange = function () {
      // if adding transfer failed - show error notification
      if (http.readyState === 4 && http.status !== 200) {
        var error = JSON.parse(http.responseText).error_message;
        var options = {
          type: 'basic',
          iconUrl: 'assets/images/icon-128.png',
          title: 'Error',
          message: error,
        };
        chrome.notifications.create('', options, () => {})
      } else if (http.readyState === 4) {
        // update transfers
        getTransfers();
      }
    };

    // send POST to add transfer
    http.send(params);

  });

};

chrome.alarms.onAlarm.addListener(function(alarm) {
  if (alarm.name === 'getTransfers') {
    getTransfers();
    chrome.alarms.create('getTransfers', { delayInMinutes: 1 });
  }
});

// see if extension has auth
checkAuth();

// check transfers every minute
chrome.alarms.create('getTransfers', { delayInMinutes: 1 });
