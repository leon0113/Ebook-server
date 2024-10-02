import { model, Schema } from 'mongoose';

const verificationTokenSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    },
    expires: {
        type: String,
        default: Date.now(),
        expires: 60 * 60 * 24
    }
})

const VerificationTokenModel = model("VerificationToken", verificationTokenSchema);

export default VerificationTokenModel;