import AuthorModel from "@/models/author.model";
import BookModel, { BookDoc } from "@/models/books.model";
import { createBookReqHandler, updateBookReqHandler } from "@/types";
import { formatFileSize, sendErrorResponse } from "@/utils/helper";
import { uploadBookToLocalDir, uploadCoverToCloudinary } from "@/utils/uploadFiles";
import { RequestHandler } from "express";
import { Types } from "mongoose";
import slugify from "slugify";

export const createNewBook: RequestHandler<{}, {}, createBookReqHandler> = async (req, res) => {

    const { body, files, user } = req;
    const { description, fileInfo, genre, language, price, publicationName, publishedAt, title } = body;

    const newBook = new BookModel<BookDoc>({
        title,
        description,
        genre,
        language,
        fileInfo: { size: formatFileSize(fileInfo.size), id: "" },
        price,
        publicationName,
        publishedAt,
        slug: "",
        authorId: new Types.ObjectId(user.authorId),
    });

    // adding book slug
    newBook.slug = slugify(`${newBook.title} ${newBook._id}`, {
        replacement: '-',
        lower: true
    });

    // book cover upload to cloudinary
    const { cover, book } = files;
    if (cover && !Array.isArray(cover)) {
        // upload to cloudinary
        newBook.cover = await uploadCoverToCloudinary(cover)
    }

    if (!book || Array.isArray(book) || book.mimetype !== 'application/epub+zip') {
        return sendErrorResponse({
            message: "Invalid book file",
            status: 422,
            res
        })
    };

    const uniqueFileName = slugify(`${newBook._id} ${newBook.title}.epub`, {
        lower: true,
        replacement: '-',
    });

    uploadBookToLocalDir(book, uniqueFileName);
    newBook.fileInfo.id = uniqueFileName;

    await AuthorModel.findByIdAndUpdate(user.authorId, {
        $push: { books: newBook._id }
    })

    await newBook.save();

    res.json({ message: "book uploaded successfully" })
};


export const updateBook: RequestHandler<{}, {}, updateBookReqHandler> = async (req, res) => {
    const { body, files, user } = req;
    const { description, fileInfo, genre, language, price, publicationName, publishedAt, title, slug } = body;
    const { cover, book } = files;
} 