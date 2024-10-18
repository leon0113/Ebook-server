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
    socialLinks: z.string().url("Provide correct links").optional()
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

