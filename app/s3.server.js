import {
  DeleteObjectCommand,
  PutObjectCommand,
  GetObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

export const s3 = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const BUCKET_NAME = process.env.S3_BUCKET;

export function getS3Key(companyName, type = "lipstick") {
  const sanitized = companyName.replace(".myshopify.com", "");
  if (type === "lipstick") {
    return `lipstick/${sanitized}-lipstick.json`;
  }
  return `${type}/${sanitized}-${type}.json`;
}

const defaultSettings = {
  threeDViewerEnabled: true,
  uploadedModels: [],
  active: "/modals/lipstick_animated.glb"
};

export async function readJson(bucket, key) {
  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    const response = await s3.send(command);
    const bodyContents = await response.Body.transformToString();
    const data = JSON.parse(bodyContents);
    
    // Inject default settings if they are missing or empty
    if (!data.settings || Object.keys(data.settings).length === 0) {
      data.settings = { ...defaultSettings };
    }
    
    return data;
  } catch (error) {
    if (error.name === "NoSuchKey") {
      return { products: [], settings: { ...defaultSettings } };
    }
    throw error;
  }
}

export async function writeToJson(bucket, key, data) {
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: JSON.stringify(data, null, 2),
      ContentType: "application/json",
    }),
  );
}

export async function deleteJson(bucket, key) {
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  await s3.send(command);
}

export async function uploadFile(bucket, key, buffer, contentType) {
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );
}
