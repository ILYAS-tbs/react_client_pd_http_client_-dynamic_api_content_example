//! FILES PREVIEW ::
type FilePreviewProps = {
  url: string;
  filename?: string;
};

export function FilePreview({ url, filename }: FilePreviewProps) {
  const extension =
    filename?.split(".").pop()?.toLowerCase() ||
    url?.split("?")?.[0]?.split("#")?.[0]?.split(".").pop()?.toLowerCase();

  //   console.log("url and file extension extracted :: ");
  //   console.log(url);
  //   console.log(extension);

  //   console.log("filename");
  //   console.log(filename);

  if (!extension) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        Download file
      </a>
    );
  }

  if (["png", "jpg", "jpeg", "gif", "webp"].includes(extension)) {
    return <img src={url} alt={filename} width={200} height="auto" />;
  }

  if (["mp4", "webm", "ogg"].includes(extension)) {
    return <video src={url} width={300} height="auto" controls />;
  }

  if (["pdf"].includes(extension)) {
    return (
      <div className="max-w-xs p-3 rounded-2xl shadow bg-gray-100 dark:bg-gray-800 flex items-center gap-3">
        {/* PDF Icon */}
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-red-100 text-red-600 rounded-lg text-2xl">
          📄
        </div>

        {/* PDF Info */}
        <div className="flex flex-col text-sm overflow-hidden">
          <span className="font-semibold truncate max-w-[140px] dark:text-gray-400">
            {filename || "document.pdf"}
          </span>
          <span className="text-xs text-gray-500">PDF File</span>

          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-block px-2 py-1 bg-green-500 text-white rounded-md text-xs hover:bg-blue-600 transition"
          >
            Open
          </a>
        </div>
      </div>
    );
  }

  // fallback: generic file (docx, xlsx, txt, etc.)
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-gray-600 hover:text-gray-500"
    >
      📎 {filename || "Download file (Preview Unsupported)"}
    </a>
  );
}
