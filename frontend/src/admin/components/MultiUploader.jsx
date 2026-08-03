import { useRef, useState } from "react";
import { LuUpload, LuX, LuLoaderCircle, LuFile } from "react-icons/lu";
import toast from "react-hot-toast";
import { api, API_BASE_URL } from "../api/client";

const ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");
const resolveUrl = (url) => (url.startsWith("http") ? url : `${ORIGIN}${url}`);

// Handles both:
//  - mode="images": value is string[] of image URLs (project gallery)
//  - mode="documents": value is {name,url}[] (project attachments)
export default function MultiUploader({ value = [], onChange, type = "misc", label, mode = "images" }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const endpoint = mode === "documents" ? "/upload/file" : "/upload/image";
      const res = await api.upload(endpoint, file, type);
      if (mode === "documents") {
        onChange([...value, { name: file.name, url: res.data.url }]);
      } else {
        onChange([...value, res.data.url]);
      }
      toast.success("File uploaded.");
    } catch (err) {
      toast.error(err.message || "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeAt(idx) {
    onChange(value.filter((_, i) => i !== idx));
  }

  return (
    <div>
      <label className="block text-sm font-medium text-cloud-300 mb-1.5">{label}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((item, idx) =>
          mode === "documents" ? (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 rounded-lg bg-ink-900 border border-ink-600 px-2.5 py-1.5 text-xs text-cloud-300"
            >
              <LuFile className="h-3.5 w-3.5" />
              {item.name}
              <button type="button" onClick={() => removeAt(idx)} className="text-coral-400">
                <LuX className="h-3 w-3" />
              </button>
            </span>
          ) : (
            <div key={idx} className="relative">
              <img src={resolveUrl(item)} alt="" className="h-14 w-14 object-cover rounded-lg border border-ink-600" />
              <button
                type="button"
                onClick={() => removeAt(idx)}
                className="absolute -top-1.5 -right-1.5 h-4.5 w-4.5 rounded-full bg-coral-500 text-white flex items-center justify-center"
              >
                <LuX className="h-3 w-3" />
              </button>
            </div>
          )
        )}
      </div>
      <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-ink-600 px-3.5 py-2 text-sm font-medium text-cloud-300 hover:bg-ink-700">
        {uploading ? <LuLoaderCircle className="h-4 w-4 animate-spin" /> : <LuUpload className="h-4 w-4" />}
        {uploading ? "Uploading…" : mode === "documents" ? "Add document" : "Add image"}
        <input
          ref={inputRef}
          type="file"
          accept={mode === "documents" ? ".pdf,.doc,.docx,image/*" : "image/*"}
          onChange={handleFile}
          className="hidden"
          disabled={uploading}
        />
      </label>
    </div>
  );
}
