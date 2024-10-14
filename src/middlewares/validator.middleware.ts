import { RequestHandler } from "express";
import { z, ZodRawShape } from "zod";

export const emailValidationSchema = {
    email: z.string({ required_error: "Email is missing!", invalid_type_error: "Invalid Email type!" }).email("Invalid email!")
};

export const newUserSchema = {
    name: z.string({ required_error: "Name is missing!", invalid_type_error: "Invalid" }).min(3, 'Name must be 3 character long!').trim()
}

export const validate = <T extends ZodRawShape>(obj: T): RequestHandler => {
    return (req, res, next) => {
        const schema = z.object(obj);

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

