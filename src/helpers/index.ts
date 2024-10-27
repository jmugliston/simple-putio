/* eslint-disable @typescript-eslint/no-explicit-any */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = [
    "Bytes",
    "KiB",
    "MiB",
    "GiB",
    "TiB",
    "PiB",
    "EiB",
    "ZiB",
    "YiB",
  ];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const truncate = (str: string, n: number = 55) =>
  str.length > n ? str.slice(0, n - 1) + "..." : str;

const customTimeFormatter = (
  value: number,
  unit: string,
  suffix: string,
  epochSeconds: number,
  nextFormatter: any
) => {
  if (unit === "second" && value < 60) {
    return "< 1 minute ago";
  }
  return nextFormatter(value, unit, suffix, epochSeconds);
};

export { delay, formatBytes, customTimeFormatter, truncate };
