import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';


//function to check JWT token
export const verifyJWTToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.jwt;

  if (!token) {
    req.flash("errors", "Token not found");
    return res.redirect('/login');
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user  = decoded;
  } catch (err) {
    req.flash("errors", "Invalid token");
    return res.redirect('/login');
  }
  return next();
};

//function to check if user is logged in
export const isLoggedIn = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.isLoggedIn) {
    req.flash("errors", "Login required");
    return res.redirect('/login');
  }
  next();
}


