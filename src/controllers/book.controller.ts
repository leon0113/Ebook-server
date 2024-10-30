import cloudinary from "@/cloud/cloudinary";
import AuthorModel from "@/models/author.model";
import BookModel, { BookDoc } from "@/models/books.model";
import HistoryModel from "@/models/history.model";
import UserModel from "@/models/user.model";
import { createBookReqHandler, updateBookReqHandler } from "@/types";
import { formatFileSize, sendErrorResponse } from "@/utils/helper";
import { uploadBookToLocalDir, uploadCoverToCloudinary } from "@/utils/uploadFiles";
import { RequestHandler } from "express";
import fs from 'fs';
import { ObjectId, Types } from "mongoose";
import path from "path";
import slugify from "slugify";

interface PopulatedBooks {

    cover?: {
        url: string;
        id: string;
    };
    _id: ObjectId;
    authorId: {
        _id: ObjectId;
        name: string;
        slug: string;
    };
    title: string;
};

interface settingType {
    lastLocationBook: string;
    highlights: { fill: string; selection: string }[];
}

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

    const bookToUpdate = await BookModel.findOne({
        slug,
        authorId: user.authorId,
    });

    if (!bookToUpdate) {
        return sendErrorResponse({
            res,
            status: 404,
            message: 'Book not found'
        })
    };

    bookToUpdate.title = title;
    bookToUpdate.description = description;
    bookToUpdate.language = language;
    bookToUpdate.publicationName = publicationName;
    bookToUpdate.genre = genre;
    bookToUpdate.publishedAt = publishedAt;
    bookToUpdate.price = price;

    if (book && !Array.isArray(book) && book.mimetype === "application/epub+zip") {
        // remove old book file(epub) from storage
        const uploadPath = path.join(__dirname, '../books');
        const oldFilePath = path.join(uploadPath, bookToUpdate.fileInfo.id);

        if (!fs.existsSync(oldFilePath)) {
            return sendErrorResponse({
                res,
                status: 500,
                message: 'Error deleting old book file'
            })
        }
        // remove old file from the directory 
        fs.unlinkSync(oldFilePath)

        // add new book to the storage
        const newFileName = slugify(`${bookToUpdate._id} ${bookToUpdate.title}.epub`, {
            replacement: '-',
            lower: true,
        });
        const newFilePath = path.join(uploadPath, newFileName);
        const file = fs.readFileSync(book.filepath);
        fs.writeFileSync(newFilePath, file);

        bookToUpdate.fileInfo = {
            id: newFileName,
            size: formatFileSize(fileInfo?.size || book.size)
        }
    };


    if (cover && !Array.isArray(cover) && cover.mimetype?.startsWith("image")) {
        // remove old cover file if exists
        if (bookToUpdate.cover?.id) {
            await cloudinary.uploader.destroy(bookToUpdate.cover.id);
        }
        bookToUpdate.cover = await uploadCoverToCloudinary(cover);
    }

    await bookToUpdate.save();
    res.json({ message: "Book updated successfully" });
};


export const getAllPurchasedBooks: RequestHandler = async (req, res) => {
    const user = await UserModel.findById(req.user.id).populate<{ books: PopulatedBooks[] }>({ path: "books", select: 'authorId title cover', populate: { path: "authorId", select: 'slug name' } });
    if (!user) {
        res.json({ books: [] });
        return;
    };

    res.json({
        books: user?.books.map(book => ({
            id: book._id,
            title: book.title,
            cover: book.cover?.url,
            author: {
                name: book.authorId.name,
                slug: book.authorId.slug
            }
        }))
    })
};


export const getBooksPublicDetails: RequestHandler = async (req, res) => {
    const { slug } = req.params;
    const book = await BookModel.findOne({ slug }).populate<{ authorId: PopulatedBooks['authorId'] }>({ path: 'authorId', select: 'name slug' })

    if (!book) {
        return sendErrorResponse({
            res, status: 404, message: 'No book available'
        })
    };

    const { _id, title, cover, authorId, slug: bookSlug, description, genre, language, publishedAt, publicationName, price, fileInfo, averageRating } = book;

    res.json({
        book: {
            id: _id,
            title,
            cover: cover?.url,
            authorId: {
                id: authorId._id,
                name: authorId.name,
                slug: authorId.slug
            },
            slug: bookSlug,
            description,
            genre,
            rating: averageRating?.toFixed(1),
            language,
            publishedAt: publishedAt.toISOString().split("T")[0],
            publicationName,
            price: {
                mrp: (price.mrp / 100).toFixed(2),
                sale: (price.sale / 100).toFixed(2)
            },
            fileInfo
        }
    })
};


export const getBooksByGenre: RequestHandler = async (req, res) => {
    const { genre } = req.params;

    const books = await BookModel.find({ genre }).limit(5);

    res.json({
        books: books.map((book) => {
            const { _id, title, cover, averageRating, slug, genre, price: { mrp, sale }, language } = book;
            return {
                id: _id,
                title,
                cover: cover?.url,
                slug,
                genre,
                rating: averageRating?.toFixed(1),
                language,
                price: {
                    mrp: (mrp / 100).toFixed(2),
                    sale: (sale / 100).toFixed(2)
                },
            }
        })
    })
};


export const generateBookAccessUrl: RequestHandler = async (req, res) => {
    const { slug } = req.params;

    const book = await BookModel.findOne({ slug });

    if (!book) {
        return sendErrorResponse({
            res,
            status: 404,
            message: 'Book not found',
        })
    };

    const user = await UserModel.findOne({ _id: req.user.id, books: book._id });

    if (!user) {
        return sendErrorResponse({
            res,
            status: 404,
            message: 'User not found',
        })
    };

    const history = await HistoryModel.findOne({ bookId: book._id, userId: user._id });



    const settings: settingType = {
        lastLocationBook: '',
        highlights: []
    }

    if (history) {
        settings.highlights = history.highlights.map(h => ({ fill: h.fill, selection: h.selection }));
        settings.lastLocationBook = history.lastLocationBook;
    }

    res.json({
        settings,
        url: `${process.env.BOOK_API_URL}/${book.fileInfo.id}`
    })
}