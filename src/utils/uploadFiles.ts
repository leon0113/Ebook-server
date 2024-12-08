import { fileInfo } from './../middlewares/validator.middleware';
import fs from 'fs';
import cloudinary from '@/cloud/cloudinary';
import { File } from 'formidable';
import path from 'path';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import s3Client from '@/cloud/aws';
import { generateS3ClientPublicUrl } from './helper';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

type TAvatar = {
    id: string;
    url: string;
};

export const cloudinaryUpload = async (file: File, avatarId?: string): Promise<TAvatar> => {
    // if the user already has a avatar. Remove it first from cloudinary
    if (avatarId) {
        await cloudinary.uploader.destroy(avatarId)
    }

    const { public_id, secure_url } = await cloudinary.uploader.upload(file.filepath, {
        width: 300,
        height: 300,
        gravity: 'face',
        crop: 'fill'
    });

    return { id: public_id, url: secure_url };
};

export const uploadCoverToCloudinary = async (file: File) => {
    const { secure_url, public_id } = await cloudinary.uploader.upload(file.filepath);
    return { id: public_id, url: secure_url }
}

export const uploadBookToLocalDir = (book: File, uniqueFileName: string) => {
    const bookStoragePath = path.join('/tmp', 'books');

    if (!fs.existsSync(bookStoragePath)) {
        fs.mkdirSync(bookStoragePath, { recursive: true });
    };

    const filePath = path.join(bookStoragePath, uniqueFileName);
    console.log(filePath);
    fs.writeFileSync(filePath, fs.readFileSync(book.filepath));


};


//! ===================AWS=======================================
export const updateAvatarToAWS = async (file: File, uniqueFileName: string, avatarId?: string) => {
    const bucketName = process.env.AWS_PUBLIC_BUCKET;
    // Delete previous avatar from bucket if there is any
    if (avatarId) {
        const deleteCommand = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: avatarId
        })
        await s3Client.send(deleteCommand);
    }
    // Put new avatar to the bucket
    const putCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: uniqueFileName,
        Body: fs.readFileSync(file.filepath)
    });

    await s3Client.send(putCommand);

    return {
        id: uniqueFileName,
        url: generateS3ClientPublicUrl(bucketName!, uniqueFileName)
    }
};


export const updateBookCoverToAWS = async (bucketName: string, uniqueFileName: string, filepath: string) => {
    const putCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: uniqueFileName,
        Body: fs.readFileSync(filepath)
    });

    await s3Client.send(putCommand);

    return {
        id: uniqueFileName,
        url: generateS3ClientPublicUrl(bucketName, uniqueFileName)
    }
};

interface FileInfo {
    bucketName: string;
    uniqueKey: string;
    contentType: string;
}

export const generateFileUploadUrl = async (client: S3Client, fileInfo: FileInfo) => {
    const command = new PutObjectCommand({
        Bucket: fileInfo.bucketName,
        Key: fileInfo.uniqueKey,
        ContentType: fileInfo.contentType
    });

    return await getSignedUrl(client, command)
}

