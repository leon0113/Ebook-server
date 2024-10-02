import { RequestHandler } from "express";
import crypto from 'crypto';
import VerificationTokenModel from "@/models/varificationToken.model";
import UserModel from "@/models/user.model";
import nodemailer from 'nodemailer'

export const generateAuthLink: RequestHandler = async (req, res) => {
    //TODO: generate authentication link
    //TODO: and send that link to users email address

    /* 
     1. Generate Unique token for every user
     2. Store that token securely inside the database so that we can validate it in future.
     3. Create a link which include that secure token and user information.
     4. Send that link to user's email address.
     5. Notify user to look inside the email to get the login link.
    */

    //! 0. Find the user in the db or create
    const { email } = req.body;

    let user = await UserModel.findOne({ email });

    if (!user) {
        // if no user is found then create new user
        user = await UserModel.create({ email })
    }

    const userId = user._id.toString();


    // Delete if there is already a token
    await VerificationTokenModel.findOneAndDelete({ userId });

    //!  1. Generate Unique token for every user
    const randomToken = crypto.randomBytes(36).toString('hex');

    //! 2. Store that token securely inside the database so that we can validate it in future.
    await VerificationTokenModel.create<{ userId: string }>({
        userId,
        token: randomToken,
    });

    //! 4. Send that link to user's email address.
    const transport = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: "22587e14e5bd85",
            pass: "f596943394bdeb"
        }
    });


    const link = `http://localhost:8001/verify?token=${randomToken}&userId=${userId}`


    await transport.sendMail({
        to: user.email!,
        from: 'verification@myapp.com',
        subject: 'Auth Verification for Ebook',
        html: `
         <div>
            <p>
              Please click on <a href='${link}'>this link</a> to verify your account.
            </p>
         </div>
        `
    })


    console.log(req.body);
    res.json({ message: 'Please check your email for link' });
}