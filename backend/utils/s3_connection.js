import {
    S3Client,
    PutObjectCommand
} from "@aws-sdk/client-s3";
import crypto from "crypto";

const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
    region: process.env.S3_BUCKET_REGION,
});

export async function uploadToS3(Body, ContentType) {

    const unique_file_name = crypto.randomBytes(32).toString('hex'); //creates a complex and unique file name to avoid collisions.

    const command = new PutObjectCommand({
        Key: unique_file_name,
        Body,
        ContentType,
        Bucket: process.env.S3_PROD_BUCKET_NAME
    });

    const result = await s3.send(command);

    return {
        name_used: unique_file_name,
        result,
    };
}

