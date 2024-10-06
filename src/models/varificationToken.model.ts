import { Model, model, Schema } from 'mongoose';
import { compareSync, genSaltSync, hashSync } from 'bcrypt';

interface IVerificationToken {
    userId: string;
    token: string;
    expires: Date
};

interface IMethods {
    compare(token: string): boolean
}

const verificationTokenSchema = new Schema<IVerificationToken, {}, IMethods>({
    userId: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    },
    expires: {
        type: Date,
        default: Date.now(),
        expires: 60 * 60 * 24
    }
});

verificationTokenSchema.pre('save', function (next) {
    if (this.isModified('token')) {
        const salt = genSaltSync(10);
        this.token = hashSync(this.token, salt)
    }
    next();
});

verificationTokenSchema.methods.compare = function (token: string) {
    return compareSync(token, this.token)
}

const VerificationTokenModel = model("VerificationToken", verificationTokenSchema);

export default VerificationTokenModel as Model<IVerificationToken, {}, IMethods>;