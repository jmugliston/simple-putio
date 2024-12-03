/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { act, renderHook } from "@testing-library/react";

import.meta.env.PROD = true;

import { useApiToken } from "./ApiToken";

const accessToken = "test-token";

vi.mock("../constants", () => ({
  BASE_URL: "https://api.example.com",
  CLIENT_ID: "12345",
}));

vi.mock("import.meta", () => ({
  env: {
    PROD: true,
  },
}));

interface IChrome {
  runtime: { id: string };
  identity: {
    launchWebAuthFlow: (details: unknown, cb: (url: string) => void) => void;
  };
  storage: {
    sync: {
      get: Function;
      set: Function;
    };
  };
}

let chrome = {} as IChrome;

describe("useApiToken", () => {
  beforeAll(() => {
    chrome = {
      runtime: {
        id: "testid",
      },
      identity: {
        launchWebAuthFlow: vi.fn().mockImplementation((_, cb) => {
          cb(`https://example.com/oauth#access_token=${accessToken}`);
        }),
      },
      storage: {
        sync: {
          get: vi.fn().mockImplementation((_, cb) => {
            cb({ accessToken });
          }),
          set: vi.fn(),
        },
      },
    };

    Object.assign(global, { chrome });
  });

  afterAll(() => {
    delete (global as { chrome?: IChrome }).chrome;
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return the token from storage", () => {
    const { result } = renderHook(() => useApiToken());

    expect(result.current.apiToken).toBe(accessToken);
  });

  it("should set the token from the auth flow", () => {
    const { result } = renderHook(() => useApiToken());

    act(() => {
      result.current.getAuth();
    });

    expect(chrome.identity.launchWebAuthFlow).toHaveBeenCalled();

    expect(chrome.storage.sync.set).toHaveBeenCalledWith({
      accessToken,
    });

    expect(result.current.apiToken).toBe(accessToken);
  });
});
