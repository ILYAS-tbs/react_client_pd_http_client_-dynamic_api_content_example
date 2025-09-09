import { SERVER_BASE_URL } from "../services/http_api/server_constants";
import { getCSRFToken } from "./get_CSRFToken";

//! Download in case the server requires authentication
export const handleDownloadFromURL = async (download_url: string) => {
  const latest_csrf = getCSRFToken()!;
  const response = await fetch(`${SERVER_BASE_URL}${download_url}`, {
    method: "GET",
    headers: {
      "X-CSRFToken": latest_csrf,
    },
  });
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;

  link.setAttribute("download", download_url.split("/").pop() || "");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
