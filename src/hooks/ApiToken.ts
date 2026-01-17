import { useEffect, useState } from "react";
import { BASE_URL, CLIENT_ID } from "../constants";

function useApiToken() {
  const [apiToken, setApiToken] = useState("");

  const getAuth = () => {
    const url = new URL("/v2/oauth2/authenticate", BASE_URL);
    url.searchParams.append("client_id", CLIENT_ID.toString());
    url.searchParams.append("response_type", "token");
    url.searchParams.append(
      "redirect_uri",
      `https://${chrome.runtime.id}.chromiumapp.org/oauth`,
    );

    chrome.identity.launchWebAuthFlow(
      {
        url: url.toString(),
        interactive: true,
      },
      (responseUrl) => {
        /* v8 ignore next 4 */
        if (!responseUrl) {
          console.warn("No response URL from auth flow");
          return;
        }
        const token = responseUrl.split("=")[1];
        chrome.storage.sync.set({ accessToken: token });
        setApiToken(token);
      },
    );
  };

  useEffect(() => {
    if (import.meta.env.PROD) {
      chrome.storage.sync.get("accessToken", ({ accessToken: apiToken }) => {
        setApiToken(apiToken as string);
      });
      /* v8 ignore next 4 */
    } else {
      const token = import.meta.env.VITE_ACCESS_TOKEN || "test";
      setApiToken(token);
    }
  }, []);

  return { apiToken, getAuth };
}

export default useApiToken;
export { useApiToken };
