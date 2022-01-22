import express,{ Application } from "express"
import session from "express-session"
import flash from "express-flash"
import path from "path"
import bodyParser from "body-parser"
import passport from "passport"
import MongoStore from "connect-mongo"
import mongoose from "mongoose"
import bluebird from "bluebird"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"

//Controllers
import * as homeController from "./controllers/home"
import * as authController from "./controllers/auth"
import * as usersController from "./controllers/users"
import * as passportController from "./config/passport"
import * as jwtController from "./config/jwt"

const app: Application = express()

//ENV CONFIG SETTINGS
dotenv.config({ path: ".env" })

//MONGOOSE SETTINGS
mongoose.Promise = bluebird
mongoose.connect(process.env.MONGODB_URI_LOCAL).then(
    () => { console.log('DB connection successful!') },
).catch(err => {
    console.log(`MongoDB connection error. Please make sure MongoDB is running. ${err}`)    
})

//EXPRESS SETTINGS
app.set("port", process.env.PORT || 5000)
app.set("views", path.join(__dirname, "/views"))
app.use(express.static(path.join(__dirname, "public")))
app.set("view engine", "pug")
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser());
app.use(flash())
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
    store: new MongoStore({
        mongoUrl: process.env.MONGODB_URI_LOCAL    
    })
}))
app.use(passport.initialize())
app.use(passport.session())
app.use((req, res, next) => {
    res.locals.user = req.user
    next()
})

//ROUTES
app.get('/',homeController.index)
app.get('/login',authController.getLogin)
app.post('/login', authController.postLogin)
app.get("/logout", authController.logout)
app.get("/signup", authController.getSignup)
app.post("/signup", authController.postSignup)
app.get("/account", passportController.isAuthenticated,jwtController.verifyJWTToken,jwtController.isLoggedIn,authController.getAccount)
app.post("/account/update",passportController.isAuthenticated,authController.updateProfile)
app.post("/account/password", passportController.isAuthenticated,authController.updatePassword)
app.post("/account/delete",passportController.isAuthenticated,authController.deleteAccount)
app.get("/users",passportController.isAuthenticated,jwtController.verifyJWTToken,jwtController.isLoggedIn,usersController.usersData)

//EXPORT APP
export default app