import { useEffect, useState } from "react";

import ApiService from "../services/Api";

function Footer({ api }: { api: ApiService }) {
  const [diskInfo, setDiskInfo] = useState<{ used: number; free: number }>({
    used: 0,
    free: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      const { used, free } = await api.getDiskInfo();
      setDiskInfo({
        used,
        free,
      });
    };

    fetchData();
  }, [api]);

  return (
    <footer className="flex justify-center my-2">
      <div className="w-1/2">
        <div className="relative h-5 w-full bg-gray-100 rounded overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-amber-300"
            style={{ width: `${diskInfo.used}%` }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center text-xs">
            Used: {diskInfo.used}% ({diskInfo.free}GB Free)
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
