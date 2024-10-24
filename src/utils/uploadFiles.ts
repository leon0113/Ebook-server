import fs from 'fs';
import cloudinary from '@/cloud/cloudinary';
import { File } from 'formidable';
import path from 'path';
import slugify from 'slugify';

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

export const uploadBookToLocalDir = (file: File, uniqueFileName: string) => {
    const bookStoragePath = path.join(__dirname, '../books');

    if (!fs.existsSync(bookStoragePath)) {
        fs.mkdirSync(bookStoragePath)
    };

    const filePath = path.join(bookStoragePath, uniqueFileName);
    fs.writeFileSync(filePath, fs.readFileSync(file.filepath));


}
