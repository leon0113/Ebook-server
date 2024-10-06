import UserModel from "@/models/user.model";
import VerificationTokenModel from "@/models/varificationToken.model";
import { sendErrorResponse } from "@/utils/helper";
import { sendVerificationMail } from "@/utils/mail";
import crypto from 'crypto';
import { RequestHandler } from "express";
import jwt from 'jsonwebtoken';


//TODO: generate authentication link
//TODO: and send that link to users email address
export const generateAuthLink: RequestHandler = async (req, res) => {
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
    })

    res.json({ authToken })
}