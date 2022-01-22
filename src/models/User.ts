import bcrypt from "bcrypt"
import crypto from "crypto"
import mongoose from "mongoose"


//TYPESCRIPT SETTINGS FOR USER
export type UserDocument = mongoose.Document & {
    
    id?: any;
    email: string
    username:string
    password: string
    passwordResetToken: string
    passwordResetExpires: Date
    token: String
   
    tokens: AuthToken[]

    profile: {
        name: string
        surname: string     
        picture: string
    };

    comparePassword: comparePasswordFunction  
    
}

type comparePasswordFunction = (candidatePassword: string, cb: (err: any, isMatch: any) => void) => void

export interface AuthToken {
    accessToken: string
    kind: string
}

//USER SCHEMA 
const userSchema = new mongoose.Schema<UserDocument>(
    {
        email: { type: String, unique: true },
        username: {type: String},
        password: String,
        passwordResetToken: String,
        passwordResetExpires: Date,    
        
        tokens: Array,       
    
        profile: {
            name: String,
            surname: String,           
            picture: String
        }
    },
    { timestamps: true },
)

//MIDDLEWARE BEFORE SAVE (CRYPT THE PASSWORD)
userSchema.pre('save', function save(next){
    const user = this as UserDocument
    const saltRounds = 10     
    if (!user.isModified("password")) { return next() }
    bcrypt.hash(user.password, saltRounds, function(err, hash) {
        if (err) { return next(err) }
        user.password = hash
        next()
    })
})

//CHECK PASSWORD METHOD
const comparePassword: comparePasswordFunction = function (candidatePassword, cb) {    
    bcrypt.compare(candidatePassword, this.password, (err: mongoose.Error, isMatch: boolean) => {
        cb(err, isMatch);
    })
};

userSchema.methods.comparePassword = comparePassword

//EXPORT USER
export const User = mongoose.model<UserDocument>("User", userSchema);
