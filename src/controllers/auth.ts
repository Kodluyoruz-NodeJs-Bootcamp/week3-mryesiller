import passport from "passport"
import jwt from "jsonwebtoken"
import { User, UserDocument, AuthToken } from "../models/User"
import { Request, Response, NextFunction,RequestHandler } from "express"
import { IVerifyOptions } from "passport-local"
import { WriteError } from "mongodb"
import { body, check, validationResult } from "express-validator"
import "../config/passport"
import { CallbackError, NativeError } from "mongoose"
import session from "express-session"


//LOGIN PAGE
export const getLogin = (req: Request, res: Response): void => {
    if (req.user) {
        return res.redirect("/")
    }
    res.render("account/_login", {
        title: "Login",
    })
}

//Declare express-session types (it doesnt work inside typesdirectory)
declare module "express-session" {
    export interface SessionData {
        user: object;
        isLoggedIn:boolean;
    }
}

//LOGIN POST METHOD
export const postLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await check("email", "Email is not valid").isEmail().run(req);
    await check("password", "Password cannot be blank").isLength({min: 1}).run(req)
    await body("email").normalizeEmail({ gmail_remove_dots: false }).run(req)

    const browser = req.headers["user-agent"]    

    //@ts-ignore
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        req.flash("errors", errors.array())
        return res.redirect("/login")
    }
    passport.authenticate("local", (err: Error, user: UserDocument, info: IVerifyOptions) => {
        if (err) { return next(err) }
        if (!user) {
            req.flash("errors", {msg: info.message})
            return res.redirect("/login")
        }

        const email=req.body.email
        const token = jwt.sign(
            { user_id: user._id, email },
            process.env.JWT_SECRET as string,
            {
                expiresIn: "25m",
            }
        )
        // save user token
        user.token = token;
        // token added to cookies
        res.cookie('jwt', token);        
        //save sessions
        req.session.isLoggedIn = true       
        req.session.user = user        

        req.logIn(user, (err) => {
            if (err) { return next(err); }        

            req.flash("success", { msg: "Success! You are logged in." }) 
            res.redirect("/")
        })

    })(req, res, next)
}

//LOGOUT
export const logout = (req: Request, res: Response): void => {
    req.logout()
    res.cookie("jwt", "", { maxAge: 1 })
    res.clearCookie("connect.sid", { path: "/" });
    req.session.destroy(() => {       
        res.redirect("/")
    })
}

//SIGNUP PAGE
export const getSignup = (req: Request, res: Response): void => {
    if (req.user) {
        return res.redirect("/")
    }
    res.render("account/_signup", {
        title: "Create Account"
    })
}

//SIGNUP POST METHOD
export const postSignup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await check("email", "Email is not valid").isEmail().run(req);
    await check("password", "Password must be at least 6 characters long").isLength({ min: 6 }).run(req)
    await check("confirmPassword", "Passwords do not match").equals(req.body.password).run(req)
    await body("email").normalizeEmail({ gmail_remove_dots: false }).run(req)

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        req.flash("errors", errors.array())
        return res.redirect("/signup")
    }

    const user = new User({
        username:req.body.username,
        email: req.body.email,
        password: req.body.password
    })     

    User.findOne({ email: req.body.email }, (err: NativeError, existingUser: UserDocument) => {
        if (err) { return next(err) }
        if (existingUser) {
            req.flash("errors", { msg: "Account with that email address already exists." })
            return res.redirect("/signup")
        }
       
        user.save((err) => {
            if (err) { return next(err) }
            req.flash("success", { msg: "Account created.You can Login" })
                res.redirect("/login")           
        })
    })
}

//ACCOUNT PAGE
export const getAccount = (req: Request, res: Response): void => {
    res.render("account/_profile", {
        title: "Account Management"
    })
};


//UPDATE PROFIL
 export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await check("email", "Please enter a valid email address.").isEmail().run(req)
    await body("email").normalizeEmail({ gmail_remove_dots: false }).run(req)

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        req.flash("errors", errors.array())
        return res.redirect("/account")
    }

    const user = req.user as UserDocument;
    User.findById(user.id, (err: NativeError, user: UserDocument) => {
        if (err) { return next(err); }
        user.email = req.body.email || ""
        user.profile.name = req.body.name || ""            
        user.save((err: WriteError & CallbackError) => {
            if (err) {
                if (err.code === 11000) {
                    req.flash("errors", { msg: "The email address you have entered is already associated with an account." })
                    return res.redirect("/account")
                }
                return next(err)
            }
            req.flash("success", { msg: "Profile information has been updated." })
            res.redirect("/account")
        })
    })
}

//UPDATE PASSWORD
 export const updatePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await check("password", "Password must be at least 6 characters long").isLength({ min: 6 }).run(req)
    await check("confirmPassword", "Passwords do not match").equals(req.body.password).run(req)

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        req.flash("errors", errors.array())
        return res.redirect("/account")
    }

    const user = req.user as UserDocument;
    User.findById(user.id, (err: NativeError, user: UserDocument) => {
        if (err) { return next(err); }
        user.password = req.body.password;
        user.save((err: WriteError & CallbackError) => {
            if (err) { return next(err); }
            req.flash("success", { msg: "Password has been changed." })
            res.redirect("/account");
        });
    });
}

//DELETE ACCOUNT
 export const deleteAccount = (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user as UserDocument;
    User.remove({ _id: user.id }, (err) => {
        if (err) { return next(err); }
        req.logout();
        req.flash("info", { msg: "Your account has been deleted." })
        res.redirect("/");
    })
}