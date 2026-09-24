const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");

const hasCloudinary = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Uploads a file buffer either to Cloudinary or to local uploads directory
 */
async function uploadImageBuffer(buffer, originalname, folder = "avatars") {
  if (hasCloudinary) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `talent_registry/${folder}`,
          resource_type: "image",
          transformation: [
            { width: 500, height: 500, crop: "fill", gravity: "face" },
            { quality: "auto" },
            { fetch_format: "auto" },
          ],
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        }
      );
      uploadStream.end(buffer);
    });
  }

  // Local file storage fallback
  const uploadsDir = path.join(__dirname, "../../uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const ext = path.extname(originalname) || ".png";
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const filename = `${folder}-${uniqueSuffix}${ext}`;
  const filepath = path.join(uploadsDir, filename);

  fs.writeFileSync(filepath, buffer);
  return `/uploads/${filename}`;
}

/**
 * Delete image either from Cloudinary or local disk
 */
async function deleteImage(imageUrl) {
  if (!imageUrl) return;

  try {
    if (imageUrl.includes("cloudinary.com") && hasCloudinary) {
      // Extract public_id
      const parts = imageUrl.split("/");
      const uploadIndex = parts.indexOf("upload");
      if (uploadIndex !== -1) {
        const publicPathWithExt = parts.slice(uploadIndex + 2).join("/");
        const publicId = publicPathWithExt.replace(/\.[^/.]+$/, "");
        await cloudinary.uploader.destroy(publicId);
      }
    } else if (imageUrl.startsWith("/uploads/")) {
      const filename = path.basename(imageUrl);
      const filepath = path.join(__dirname, "../../uploads", filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }
  } catch (error) {
    console.error("[Upload Delete Warning]", error.message);
  }
}

module.exports = {
  uploadImageBuffer,
  deleteImage,
  hasCloudinary,
};
