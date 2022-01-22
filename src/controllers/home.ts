import { Request, Response } from "express"

//HOME PAGE
export const index = (req: Request, res: Response) => {
    res.render("home", {
        title: "Home"        
    });
};
