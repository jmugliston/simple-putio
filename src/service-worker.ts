const BASE_URL = "https://api.put.io";
const CLIENT_ID = "3652";
const BADGE_COLORS = {
  AMBER: "#ffc107",
  GREEN: "#28a745",
};

const getApiToken = async (): Promise<string> =>
  new Promise((resolve, reject) => {
    chrome.storage.sync.get("accessToken", async ({ accessToken }) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      return resolve(accessToken);
    });
  });

const addTransfer = async (linkUrl: string) => {
  try {
    const apiToken = await getApiToken();

    if (!apiToken) {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icons/icon-48.png",
        title: "Error",
        message: "You need to be logged in to use this feature",
      });
      return;
    }

    const url = new URL("/v2/transfers/add", BASE_URL);

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        oauth_token: apiToken,
        url: linkUrl,
      }),
    });

    const body = await response.json();

    if (!response.ok) {
      throw new Error(body.error_message);
    }

    setTimeout(() => {
      getTransfers();
    }, 1000);
  } catch (err) {
    console.error(err);
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/icon-48.png",
      title: "Error",
      message: "Something went wrong creating the transfer",
    });
  }
};

const updateBadge = (text: string, color?: string) => {
  chrome.action.setBadgeText({
    text,
  });
  if (color) {
    chrome.action.setBadgeBackgroundColor({ color });
  }
};

const getTransfers = async () => {
  const apiToken = await getApiToken();

  if (!apiToken) {
    return;
  }

  const url = new URL("/v2/transfers/list", BASE_URL);
  url.searchParams.append("client_id", CLIENT_ID);
  url.searchParams.append("oauth_token", apiToken);

  const res = await fetch(url.toString(), { method: "GET" });

  const { transfers } = await res.json();

  if (!transfers) {
    return;
  }

  const inProgressCount = transfers.filter((t: { status: string }) =>
    ["IN_QUEUE", "DOWNLOADING", "COMPLETING"].includes(t.status)
  ).length;

  const completedCount = transfers.filter(
    (t: { status: string }) => t.status === "COMPLETED"
  ).length;

  switch (true) {
    case completedCount > 0 && inProgressCount > 0:
      updateBadge(`${inProgressCount}/${completedCount}`, BADGE_COLORS.AMBER);
      break;
    case completedCount > 0 && inProgressCount === 0:
      updateBadge(completedCount.toString(), BADGE_COLORS.GREEN);
      break;
    case completedCount >= 0 && inProgressCount > 0:
      updateBadge(inProgressCount.toString(), BADGE_COLORS.AMBER);
      break;
    case completedCount === 0 && inProgressCount === 0:
      updateBadge("");
      break;
  }
};

const checkAlarmState = async () => {
  const alarm = await chrome.alarms.get("getTransfers");
  if (!alarm) {
    await chrome.alarms.create("getTransfers", {
      delayInMinutes: 1,
      periodInMinutes: 1,
    });
  }
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    title: "Send to Put.io",
    id: "parent",
    contexts: ["link", "selection"],
  });
});

chrome.contextMenus.onClicked.addListener((data) => {
  if (!data.linkUrl) {
    return;
  }
  addTransfer(data.linkUrl);
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "getTransfers") {
    await getTransfers();
  }
});

checkAlarmState();

getTransfers();
