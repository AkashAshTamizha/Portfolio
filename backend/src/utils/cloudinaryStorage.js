import { getCloudinary } from "../config/cloudinary.js";

/**
 * A minimal Multer storage engine that streams the incoming file straight
 * to Cloudinary (no temp files, no local disk involved).
 *
 * `getParams(req, file)` returns the Cloudinary upload options for this
 * particular file (folder, resource_type, public_id, etc.) — see
 * middleware/upload.js for how it's used.
 */
export class CloudinaryStorage {
  constructor({ getParams }) {
    this.getParams = getParams;
  }

  _handleFile(req, file, cb) {
    let params;
    try {
      params = this.getParams(req, file);
    } catch (err) {
      return cb(err);
    }

    const cloudinary = getCloudinary();
    const uploadStream = cloudinary.uploader.upload_stream(params, (error, result) => {
      if (error) return cb(error);
      cb(null, {
        path: result.secure_url,
        filename: result.public_id,
        resource_type: result.resource_type,
        size: result.bytes,
      });
    });

    file.stream.pipe(uploadStream);
  }

  _removeFile(_req, file, cb) {
    if (!file.filename) return cb(null);
    getCloudinary()
      .uploader.destroy(file.filename, { resource_type: file.resource_type || "image" })
      .then(() => cb(null))
      .catch(cb);
  }
}

export default CloudinaryStorage;
