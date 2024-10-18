import cloudinary from '@/cloud/cloudinary';
import { File } from 'formidable';

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
}