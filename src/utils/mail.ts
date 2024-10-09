import nodemailer from 'nodemailer';

interface VerificationMailOptions {
    link: string,
    to: string,
};


const transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: process.env.MAILTRAP_TEST_USER,
        pass: process.env.MAILTRAP_TEST_PASS
    }
});



export async function sendVerificationMail(options: VerificationMailOptions) {
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