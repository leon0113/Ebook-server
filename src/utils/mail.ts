import nodemailer from 'nodemailer';
import { MailtrapClient } from "mailtrap";

interface VerificationMailOptions {
    link: string,
    to: string,
};

const TOKEN = process.env.MAILTRAP_TOKEN!;

const client = new MailtrapClient({
    token: TOKEN,
});



const transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: process.env.MAILTRAP_TEST_USER,
        pass: process.env.MAILTRAP_TEST_PASS
    }
});

const sendVerificationTestMail = async (options: VerificationMailOptions) => {
    await transport.sendMail({
        to: options.to,
        from: process.env.VERIFICATION_MAIL,
        subject: 'Auth Verification for Ebook',
        html: `
             <div>
                <h1>
                  Please click on <a href='${options.link}'>this link</a> to verify your account.
                </h1>
             </div>
            `
    });
}


const sendVerificationMailMainAcc = async (options: VerificationMailOptions) => {
    const sender = {
        email: "no-reply@tahjib.online",
        name: "Bookie Sign up/in",
    };
    const recipients = [
        {
            email: options.to,
        }
    ];

    await client
        .send({
            from: sender,
            to: recipients,
            template_uuid: "86bfbe0c-123c-46b3-aacb-ccb1bbe55a41",
            template_variables: {
                "link": `${options.link}`,
                "userName": `${options.to}`
            }
        })
        .then(console.log, console.error);
};


export async function sendVerificationMail(options: VerificationMailOptions) {
    if (process.env.NODE_ENV === 'development') {
        await sendVerificationTestMail(options)
    } else {
        sendVerificationMailMainAcc(options)
    }
};



