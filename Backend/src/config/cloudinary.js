import { v2 as cloudinary } from "cloudinary";

let isConfigured = false;

const connectCloudinary = async () => {
  if (isConfigured) {
    return cloudinary;
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  isConfigured = true;
  return cloudinary;
};

export const uploadBufferToCloudinary = async (buffer, options = {}) => {
  const configuredCloudinary = await connectCloudinary();

  return new Promise((resolve, reject) => {
    const uploadStream = configuredCloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        ...options,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
};

export { cloudinary };
export default connectCloudinary;