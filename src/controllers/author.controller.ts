import AuthorModel from "@/models/author.model";
import UserModel from "@/models/user.model";
import { authorReqBody } from "@/types";
import { sendErrorResponse } from "@/utils/helper";
import { RequestHandler } from "express";
import slugify from "slugify";

export const registerAuthor: RequestHandler<{}, {}, authorReqBody> = async (req, res) => {
    const { body, user } = req;

    if (!user.signedUp) {
        return sendErrorResponse({
            res,
            status: 401,
            message: "User must be signed up before registering as author"
        })
    }

    const newAuthor = await AuthorModel.create({
        userId: user.id,
        name: body.name,
        about: body.about,
        socialLinks: body.socialLinks,
    });

    const uniqueSlug = slugify(`${newAuthor.name} ${newAuthor._id}`, {
        replacement: '-',
        lower: true,
    });

    newAuthor.slug = uniqueSlug;
    await newAuthor.save();

    await UserModel.findByIdAndUpdate(user.id, { role: 'author', authorId: newAuthor._id });

    res.json({ message: "Author registration successful!!!" })
};

export const updateAuthor: RequestHandler<{}, {}, authorReqBody> = async (req, res) => {
    const { body, user } = req;

    await AuthorModel.findByIdAndUpdate(user.authorId, {
        name: body.name,
        about: body.about,
        socialLinks: body.socialLinks
    });

    res.json({ message: "Author update successful!!!" })
};

export const getAuthorDetails: RequestHandler = async (req, res) => {
    const { slug } = req.params;

    const author = await AuthorModel.findOne({ slug });

    if (!author) {
        return sendErrorResponse({
            res,
            status: 404,
            message: "Author not found"
        })
    };

    res.json({
        id: author._id,
        name: author.name,
        about: author.about,
        socials: author.socialLinks,
        books: author.books
    })
}