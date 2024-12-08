import s3Client from "@/cloud/aws";
import cloudinary from "@/cloud/cloudinary";
import AuthorModel from "@/models/author.model";
import BookModel, { BookDoc } from "@/models/books.model";
import HistoryModel from "@/models/history.model";
import ReviewModel from "@/models/review.model";
import UserModel from "@/models/user.model";
import { createBookReqHandler, updateBookReqHandler } from "@/types";
import {
    formatBook,
    formatFileSize,
    sendErrorResponse
} from "@/utils/helper";
import {
    generateFileUploadUrl,
    updateBookCoverToAWS,
    uploadCoverToCloudinary
} from "@/utils/uploadFiles";
import { DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { RequestHandler } from "express";
import { isValidObjectId, ObjectId, Types } from "mongoose";
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
    slug: string;
}

interface settingType {
    lastLocationBook: string;
    highlights: { fill: string; selection: string }[];
}

interface RecommendedBooks {
    id: string;
    title: string;
    genre: string;
    slug: string;
    cover?: string;
    rating?: string;
    price: {
        mrp: string;
        sale: string;
    };
}

export interface AggregationResult {
    _id: ObjectId;
    title: string;
    genre: string;
    price: {
        mrp: number;
        sale: number;
        _id: ObjectId;
    };
    cover?: {
        url: string;
        id: string;
        _id: ObjectId;
    };
    slug: string;
    averageRating?: number;
}

export const createNewBook: RequestHandler<{}, {}, createBookReqHandler> = async (req, res) => {

    const { body, files, user } = req;
    const { cover, book } = files;

    const {
        description,
        fileInfo,
        genre,
        language,
        price,
        publicationName,
        publishedAt,
        title,
        status
    } = body;

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
        status,
        authorId: new Types.ObjectId(user.authorId),
    });

    // adding book slug
    newBook.slug = slugify(`${newBook.title} ${newBook._id}`, {
        replacement: "-",
        lower: true,
    });

    const fileName = slugify(`${newBook._id} ${newBook.title}.epub`, {
        lower: true,
        replacement: "-",
    });
    // generate upload link to upload book from frontend
    const fileUploadUrl = await generateFileUploadUrl(s3Client, {
        bucketName: process.env.AWS_PRIVATE_BUCKET!,
        uniqueKey: fileName,
        contentType: fileInfo.type,
    });

    newBook.fileInfo.id = fileName;



    //! book cover upload to cloudinary
    // if (cover && !Array.isArray(cover)) {
    //     // upload to cloudinary
    //     newBook.cover = await uploadCoverToCloudinary(cover)
    // }

    // if (!book || Array.isArray(book) || book.mimetype !== 'application/epub+zip') {
    //     return sendErrorResponse({
    //         message: "Invalid book file",
    //         status: 422,
    //         res
    //     })
    // };

    // const uniqueFileName = slugify(`${newBook._id} ${newBook.title}.epub`, {
    //     lower: true,
    //     replacement: '-',
    // });

    // uploadBookToLocalDir(book, uniqueFileName);
    // newBook.fileInfo.id = uniqueFileName;

    // await AuthorModel.findByIdAndUpdate(user.authorId, {
    //     $push: { books: newBook._id }
    // })

    //!  cover upload to AWS S3 bucket
    const uniqueFileName = slugify(`${newBook._id} ${newBook.title}.jpg`, {
        lower: true,
        replacement: "-",
    });

    if (cover && !Array.isArray(cover) && cover.mimetype?.startsWith("image")) {
        newBook.cover = await updateBookCoverToAWS(
            process.env.AWS_PUBLIC_BUCKET!,
            uniqueFileName,
            cover.filepath
        );
    };

    await AuthorModel.findByIdAndUpdate(user.authorId, {
        $push: { books: newBook._id }
    })

    await newBook.save();

    await UserModel.findByIdAndUpdate(user.id, {
        $push: { books: newBook._id }
    })

    res.send(fileUploadUrl);
};

export const updateBook: RequestHandler<{}, {}, updateBookReqHandler> = async (
    req,
    res
) => {
    const { body, files, user } = req;

    const {
        description,
        fileInfo,
        genre,
        language,
        price,
        publicationName,
        publishedAt,
        title,
        slug,
        status
    } = body;

    const { cover, book } = files;

    const bookToUpdate = await BookModel.findOne({
        slug,
        authorId: user.authorId,
    });

    if (!bookToUpdate) {
        return sendErrorResponse({
            res,
            status: 404,
            message: "Book not found",
        });
    }

    bookToUpdate.title = title;
    bookToUpdate.description = description;
    bookToUpdate.language = language;
    bookToUpdate.publicationName = publicationName;
    bookToUpdate.genre = genre;
    bookToUpdate.publishedAt = publishedAt;
    bookToUpdate.price = price;
    bookToUpdate.status = status;


    let fileUploadUrl = '';
    if (
        book &&
        !Array.isArray(book) &&
        book.mimetype === "application/epub+zip"
    ) {
        // first remove the old book form aws bucket
        const deleteCommand = new DeleteObjectCommand({
            Bucket: process.env.AWS_PRIVATE_BUCKET,
            Key: bookToUpdate.fileInfo.id,
        });

        await s3Client.send(deleteCommand);

        // const fileName = slugify(`${bookToUpdate._id} ${bookToUpdate.title}.epub`, {
        //     lower: true,
        //     replacement: "-",
        // });

        // generate new url to upload book to aws bucket
        fileUploadUrl = await generateFileUploadUrl(s3Client, {
            bucketName: process.env.AWS_PRIVATE_BUCKET!,
            uniqueKey: bookToUpdate.fileInfo.id,
            contentType: fileInfo?.type || book.mimetype,
        });


        // // remove old book file(epub) from storage
        // const uploadPath = path.join(__dirname, "../books");
        // const oldFilePath = path.join(uploadPath, bookToUpdate.fileInfo.id);

        // if (!fs.existsSync(oldFilePath)) {
        //     return sendErrorResponse({
        //         res,
        //         status: 500,
        //         message: "Error deleting old book file",
        //     });
        // }
        // // remove old file from the directory
        // fs.unlinkSync(oldFilePath);

        // // add new book to the storage
        // const newFileName = slugify(
        //     `${bookToUpdate._id} ${bookToUpdate.title}.epub`,
        //     {
        //         replacement: "-",
        //         lower: true,
        //     }
        // );
        // const newFilePath = path.join(uploadPath, newFileName);
        // const file = fs.readFileSync(book.filepath);
        // fs.writeFileSync(newFilePath, file);

        // bookToUpdate.fileInfo = {
        //     id: newFileName,
        //     size: formatFileSize(fileInfo?.size || book.size),
        // };
    };

    if (cover && !Array.isArray(cover) && cover.mimetype?.startsWith("image")) {
        // if (bookToUpdate.cover?.id) {
        //     await cloudinary.uploader.destroy(bookToUpdate.cover.id);
        // }
        // bookToUpdate.cover = await uploadCoverToCloudinary(cover);
        //TODO: remove old cover file from Aws bucket if exists
        if (bookToUpdate.cover?.id) {
            const deleteCommand = new DeleteObjectCommand({
                Bucket: process.env.AWS_PUBLIC_BUCKET,
                Key: bookToUpdate.cover.id,
            });

            await s3Client.send(deleteCommand);
        };
        //TODO: Upload new cover to Aws bucket
        const uniqueFileName = slugify(`${bookToUpdate._id} ${bookToUpdate.title}.jpg`, {
            lower: true,
            replacement: "-",
        });

        bookToUpdate.cover = await updateBookCoverToAWS(
            process.env.AWS_PUBLIC_BUCKET!,
            uniqueFileName,
            cover.filepath
        );

    };

    await bookToUpdate.save();
    res.send(fileUploadUrl);
};

export const getAllPurchasedBooks: RequestHandler = async (req, res) => {
    const user = await UserModel.findById(req.user.id).populate<{
        books: PopulatedBooks[];
    }>({
        path: "books",
        select: "authorId title cover slug",
        populate: { path: "authorId", select: "slug name _id" },
    });
    if (!user) {
        res.json({ books: [] });
        return;
    }

    res.json({
        books: user?.books.map((book) => ({
            id: book._id,
            title: book.title,
            cover: book.cover?.url,
            slug: book.slug,
            author: {
                id: book.authorId._id,
                name: book.authorId.name,
                slug: book.authorId.slug,
            },
        })),
    });
};

export const getBooksPublicDetails: RequestHandler = async (req, res) => {
    const { slug } = req.params;
    const book = await BookModel.findOne({ slug }).populate<{
        authorId: PopulatedBooks["authorId"];
    }>({ path: "authorId", select: "name slug" });

    if (!book) {
        return sendErrorResponse({
            res,
            status: 404,
            message: "No book available",
        });
    }

    const {
        _id,
        title,
        cover,
        authorId,
        slug: bookSlug,
        description,
        genre,
        language,
        publishedAt,
        publicationName,
        price,
        fileInfo,
        averageRating,
        status,
        copySold
    } = book;

    if (status === 'unpublish') {
        return sendErrorResponse({
            res,
            status: 404,
            message: "No book available",
        })
    }

    res.json({
        book: {
            id: _id,
            title,
            cover: cover?.url,
            authorId: {
                id: authorId._id,
                name: authorId.name,
                slug: authorId.slug,
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
                sale: (price.sale / 100).toFixed(2),
            },
            fileInfo,
            status,
            copySold
        },
    });
};

export const getBooksByGenre: RequestHandler = async (req, res) => {
    const { genre } = req.params;

    const books = await BookModel.find({ genre }).limit(5);

    res.json({
        books: books.map((book) => formatBook(book))
    });
};

export const generateBookAccessUrl: RequestHandler = async (req, res) => {
    const { slug } = req.params;

    const book = await BookModel.findOne({ slug });

    if (!book) {
        return sendErrorResponse({
            res,
            status: 404,
            message: "Book not found",
        });
    }

    const user = await UserModel.findOne({ _id: req.user.id, books: book._id });

    if (!user) {
        return sendErrorResponse({
            res,
            status: 500,
            message: "Something went wrong",
        });
    }

    const history = await HistoryModel.findOne({
        bookId: book._id,
        userId: user._id,
    });

    const settings: settingType = {
        lastLocationBook: "",
        highlights: [],
    };

    if (history) {
        settings.highlights = history.highlights.map((h) => ({
            fill: h.fill,
            selection: h.selection,
        }));
        settings.lastLocationBook = history.lastLocationBook;
    };

    //! generate book access url from aws s3 bucket
    const getBookUrlCommand = new GetObjectCommand({
        Bucket: process.env.AWS_PRIVATE_BUCKET,
        Key: book.fileInfo.id
    });

    const bookAccessUrl = await getSignedUrl(s3Client, getBookUrlCommand);

    res.json({
        settings,
        url: bookAccessUrl,
    });
};

// export const getRecommendedBooks: RequestHandler = async (req, res) => {
//     const { bookId } = req.params;

//     if (!isValidObjectId(bookId)) {
//         return sendErrorResponse({
//             res,
//             status: 422,
//             message: "Invalid book id",
//         });
//     }

//     const book = await BookModel.findById(bookId);

//     if (!book) {
//         return sendErrorResponse({
//             res,
//             status: 404,
//             message: "Book not found",
//         });
//     }

//     const recommendedBooks = await BookModel.aggregate<AggregationResult>([
//         {
//             $match: {
//                 genre: book.genre,
//                 _id: { $ne: book._id },
//             },
//         },
//         {
//             $lookup: {
//                 localField: "_id",
//                 from: "reviews",
//                 foreignField: "book",
//                 as: "reviews",
//             },
//         },
//         {
//             $addFields: {
//                 averageRating: {
//                     $avg: "$reviews.rating",
//                 },
//             },
//         },
//         {
//             $sort: {
//                 averageRating: -1,
//             },
//         },
//         {
//             $limit: 5,
//         },
//         {
//             $project: {
//                 _id: 1,
//                 title: 1,
//                 slug: 1,
//                 genre: 1,
//                 price: 1,
//                 cover: 1,
//                 averageRating: 1,
//             },
//         },
//     ]);

//     // console.log(JSON.stringify(recommendedBooks, null, 2));

//     const result = recommendedBooks.map<RecommendedBooks>((books) => ({
//         id: books._id.toString(),
//         title: books.title,
//         slug: books.slug,
//         genre: books.genre,
//         price: {
//             mrp: (books.price?.mrp / 100).toFixed(2),
//             sale: (books.price?.sale / 100).toFixed(2),
//         },
//         cover: books.cover?.url,
//         rating: books.averageRating?.toFixed(2),
//     }));
//     // console.log(result);
//     res.json(result);
// };

export const getRecommendedBooks1: RequestHandler = async (req, res) => {
    const { bookId } = req.params;

    if (!isValidObjectId(bookId)) {
        return sendErrorResponse({
            res,
            status: 422,
            message: "Invalid book id",
        });
    }

    const book = await BookModel.findById(bookId);

    if (!book) {
        return sendErrorResponse({
            res,
            status: 404,
            message: "Book not found",
        });
    }

    if (book.status === 'unpublish') {
        return sendErrorResponse({
            res,
            status: 404,
            message: "Book not available",
        });
    }
    const genre = book.genre;

    const books = await BookModel.find({
        genre,
        _id: { $ne: book._id }, // Exclude the book with the same _id
    });

    res.json({
        books: books.map((book) => formatBook(book))
    });
};


export const getAllBooks: RequestHandler = async (req, res) => {
    const books = await BookModel.find().sort({ createdAt: -1 });
    res.json({
        books: books.map((book) => formatBook(book))
    });
};


export const deleteBook: RequestHandler = async (req, res) => {
    const { bookId } = req.params;
    const { user } = req;

    if (!isValidObjectId(bookId)) {
        return sendErrorResponse({
            res,
            status: 422,
            message: "Invalid book id",
        })
    };

    const book = await BookModel.findOne({ _id: bookId, authorId: user.authorId });
    if (!book) {
        return sendErrorResponse({
            res,
            status: 404,
            message: "No book found",
        })
    };

    // see if any copy was sold. if yes then we can't allow to delete the book
    if (book.copySold! >= 1) {
        res.json({
            success: false
        });
        return;
    };
    // if no then delete from everywhere
    await BookModel.findByIdAndDelete(book.id);

    // delete from author books array
    const author = await AuthorModel.findById(user.authorId);
    if (author) {
        author.books = author.books.filter((id) => id.toString() !== bookId);
        await author.save();
    };
    // delete reviews of the book
    const review = await ReviewModel.findOne({ bookId: bookId });
    if (review) {
        await ReviewModel.findByIdAndDelete(review._id)
    };

    // delete cover & book epub file from AWS S3 bucket
    const coverId = book.cover?.id;
    const bookFileId = book.fileInfo.id;

    if (coverId) {
        const deleteCommand = new DeleteObjectCommand({
            Bucket: process.env.AWS_PUBLIC_BUCKET,
            Key: coverId,
        });
        await s3Client.send(deleteCommand);
    }

    if (bookFileId) {
        const deleteCommand = new DeleteObjectCommand({
            Bucket: process.env.AWS_PRIVATE_BUCKET,
            Key: bookFileId,
        });
        await s3Client.send(deleteCommand);
    }

    res.json({
        success: true
    });
};

