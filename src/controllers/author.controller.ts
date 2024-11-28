import AuthorModel from "@/models/author.model";
import { BookDoc } from "@/models/books.model";
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
    const { id } = req.params;

    const author = await AuthorModel.findById(id).populate<{ books: BookDoc[] }>(
        "books"
    );
    if (!author)
        return sendErrorResponse({
            res,
            message: "Author not found!",
            status: 404,
        });

    const user = await UserModel.findOne({ authorId: author._id });
    const authorAvatar = user?.avatar || null;

    res.json({
        id: author._id,
        name: author.name,
        avatar: authorAvatar?.url,
        about: author.about,
        socialLinks: author.socialLinks,
        books: author.books?.map((book) => {
            return {
                id: book._id?.toString(),
                title: book.title,
                slug: book.slug,
                genre: book.genre,
                price: {
                    mrp: (book.price.mrp / 100).toFixed(2),
                    sale: (book.price.sale / 100).toFixed(2),
                },
                cover: book.cover?.url,
                rating: book.averageRating?.toFixed(1),
            };
        }),
    });
};
