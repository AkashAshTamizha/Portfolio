import { useRef, useState } from "react";
import { LuUpload, LuX, LuLoaderCircle } from "react-icons/lu";
import toast from "react-hot-toast";
import { api, API_BASE_URL } from "../api/client";

const ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

function resolveUrl(url) {
  if (!url) return "";
  return url.startsWith("http") ? url : `${ORIGIN}${url}`;
}

export default function ImageUploader({ value, onChange, type = "misc", label = "Image" }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await api.upload("/upload/image", file, type);
      onChange(res.data.url);
      toast.success("Image uploaded.");
    } catch (err) {
      toast.error(err.message || "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-cloud-300 mb-1.5">{label}</label>
      <div className="flex items-center gap-3">
        {value ? (
          <div className="relative">
            <img
              src={resolveUrl(value)}
              alt="Uploaded preview"
              className="h-16 w-16 object-cover rounded-xl border border-ink-600"
            />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-coral-500 text-white flex items-center justify-center"
              aria-label="Remove image"
            >
              <LuX className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div className="h-16 w-16 rounded-xl border border-dashed border-ink-600 flex items-center justify-center text-cloud-500">
            <LuUpload className="h-5 w-5" />
          </div>
        )}
        <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-ink-600 px-3.5 py-2 text-sm font-medium text-cloud-300 hover:bg-ink-700">
          {uploading ? <LuLoaderCircle className="h-4 w-4 animate-spin" /> : <LuUpload className="h-4 w-4" />}
          {uploading ? "Uploading…" : "Upload"}
          <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" disabled={uploading} />
        </label>
      </div>
    </div>
  );
}
