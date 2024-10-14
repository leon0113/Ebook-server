import UserModel from "@/models/user.model";
import VerificationTokenModel from "@/models/varificationToken.model";
import { FormatUserProfile, sendErrorResponse } from "@/utils/helper";
import { sendVerificationMail } from "@/utils/mail";
import crypto from 'crypto';
import { RequestHandler } from "express";
import jwt from 'jsonwebtoken';


//TODO: generate authentication link
//TODO: and send that link to users email address
export const generateAuthLink: RequestHandler = async (req, res) => {
    /* 
     0. Create or Find user.
     1. Generate Unique token for the user.
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

    //!  1. Generate New Unique token for the user
    const randomToken = crypto.randomBytes(36).toString('hex');

    //! 2. Store that token securely inside the database so that we can validate it in future.
    await VerificationTokenModel.create<{ userId: string }>({
        userId,
        token: randomToken,
    });

    //! 4. Send that link to user's email address.

    const link = `${process.env.VERIFICATION_LINK}?token=${randomToken}&userId=${userId}`

    await sendVerificationMail({
        link,
        to: user.email!
    })

    res.json({ message: 'Please check your email for link' });
}


//TODO: Verify the auth token coming from the link
export const verifyAuthToken: RequestHandler = async (req, res) => {
    const { token, userId } = req.query;

    // verify query types
    if (typeof token !== 'string' || typeof userId !== 'string') {
        return sendErrorResponse({
            status: 403,
            message: 'Invalid request',
            res,
        })
    };

    const verificationToken = await VerificationTokenModel.findOne({ userId });

    if (!verificationToken || !verificationToken.compare(token)) {
        return sendErrorResponse({
            status: 403,
            message: 'Invalid token',
            res,
        })
    };


    const user = await UserModel.findById(userId);

    if (!user) {
        return sendErrorResponse({
            status: 500,
            message: 'No user exists',
            res,
        })
    };

    await VerificationTokenModel.findByIdAndDelete(verificationToken._id);

    //TODO: Authentication of user
    const payload = { userId: user._id };

    const authToken = jwt.sign(payload, process.env.JWT_SECRET!, {
        expiresIn: '7d'
    });


    res.cookie('authToken', authToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // expires in 7 days
    })

    res.redirect(`${process.env.AUTH_SUCCESS_URL}?profile=${JSON.stringify(FormatUserProfile(user))}`)
    // res.send()
};

//TODO: Get User info
export const sendProfileInfo: RequestHandler = (req, res) => {
    res.json({
        profile: req.user
    })
}

//TODO: Logout user from the application
export const logoutUser: RequestHandler = (req, res) => {
    res.clearCookie('authToken').json(`User of email: ${req.user.email} has been logout`)
}

//TODO: Logout user from the application
export const updateProfile: RequestHandler = async (req, res) => {

    const user = await UserModel.findByIdAndUpdate(req.user.id, { name: req.body.name, signedUp: true }, {
        new: true,
    });

    if (!user) {
        return sendErrorResponse({
            res,
            message: "Something went wrong",
            status: 500
        })
    }
    // if there is any file upload them to cloud and update database


    // res.redirect(`${process.env.AUTH_SUCCESS_URL}?profile=${JSON.stringify(FormatUserProfile(user))}`)
    res.json({ profile: FormatUserProfile(user) })
}