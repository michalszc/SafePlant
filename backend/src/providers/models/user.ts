import { Maybe, User as UserType } from '../../__generated__/resolvers-types';
import { HydratedDocument, Model, Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';

export type IUser = Omit<UserType, 'id' | '__typename'> & {
    password: string;
};

interface UserModel extends Model<IUser> {
    findByLoginAndPassword(email: string, password: string): Promise<Maybe<HydratedDocument<IUser>>>;
}

const userSchema = new Schema<IUser, UserModel>({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.statics.findByLoginAndPassword = async function (email: string, password: string) {
    const user = await this.findOne({ email });

    if (!user) {
      return null;
    }
  
    const isMatch = await bcrypt.compare(password, user.password);
  
    if (!isMatch) {
      return null;
    }
  
    return user;
};

export const User = model<IUser, UserModel>('User', userSchema);
