import { RequestHandler } from "express";
import { z, ZodRawShape, ZodType } from "zod";

export const emailValidationSchema = z.object({
    email: z.string({ required_error: "Email is missing!", invalid_type_error: "Invalid Email type!" }).email("Invalid email!")
});

export const newUserSchema = z.object({
    name: z.string({ required_error: "Name is missing!", invalid_type_error: "Invalid" }).min(3, 'Name must be 3 character long!').trim()
});

export const newAuthorSchema = z.object({
    name: z.string({
        required_error: "Name is missing!",
        invalid_type_error: "Invalid name"
    }).trim().min(3, "Too short name"),
    about: z.string({
        required_error: "About is missing!",
        invalid_type_error: "Invalid about"
    }).trim().min(100, "Please write at least 100 characters about yourself"),
    socialLinks: z.array(z.string().url("Provide correct links").optional())
});

export const newBookSchema = z.object({
    title: z.string({
        required_error: "Title is missing!",
        invalid_type_error: "Invalid title"
    }).trim(),

    description: z.string({
        required_error: "Description is missing!",
        invalid_type_error: "Invalid description"
    }).trim(),

    language: z.string({
        required_error: "Language is missing!",
        invalid_type_error: "Invalid language"
    }).trim(),

    publishedAt: z.coerce.date({
        required_error: "Publish date is missing!",
        invalid_type_error: "Invalid publish date"
    }),

    publicationName: z.string({
        required_error: "Genre is missing!",
        invalid_type_error: "Invalid genre"
    }).trim(),

    genre: z.string({
        required_error: "Genre is missing!",
        invalid_type_error: "Invalid genre"
    }).trim(),

    price: z.string({
        required_error: "Price is missing!",
        invalid_type_error: "Invalid Price"
    }).transform((value, context) => {
        try {
            return JSON.parse(value)
        } catch (error) {
            context.addIssue({ code: "custom", message: "Invalid price data" });
            return z.NEVER
        }
    }).pipe(
        z.object({
            mrp: z.number({
                required_error: "MRP is missing!",
                invalid_type_error: "Invalid MRP"
            }).nonnegative("Invalid MRP"),
            sale: z.number({
                required_error: "SALE is missing!",
                invalid_type_error: "Invalid SALE"
            }).nonnegative("Invalid SALE")
        })
    ).refine((price) => price.sale <= price.mrp, "Sale price should be less then MRP"),

    fileInfo: z.string({
        required_error: "File info is missing!",
        invalid_type_error: "Invalid file info"
    }).transform((value, context) => {
        try {
            return JSON.parse(value)
        } catch (error) {
            context.addIssue({ code: "custom", message: "Invalid file info" });
            return z.NEVER
        }
    }).pipe(
        z.object({
            name: z.string({
                required_error: "fileInfo.name is missing!",
                invalid_type_error: "Invalid fileInfo.name"
            }).trim(),
            size: z.number({
                required_error: "fileInfo.size is missing!",
                invalid_type_error: "Invalid fileInfo.size"
            }).nonnegative("Invalid fileInfo.size"),
            type: z.string({
                required_error: "fileInfo.type is missing!",
                invalid_type_error: "Invalid fileInfo.type"
            }).trim(),
        })
    )
})



export const validate = <T extends unknown>(schema: ZodType<T>): RequestHandler => {
    return (req, res, next) => {

        const result = schema.safeParse(req.body);

        if (result.success) {
            req.body = result.data;
            next();
        } else {
            const err = result.error.flatten().fieldErrors;
            res.status(422).json({ err });
            return;
        }
    }
}

