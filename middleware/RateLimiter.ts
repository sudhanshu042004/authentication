import { rateLimit } from "express-rate-limit";

export const limitMiddleWare = rateLimit({
    windowMs : 5 * 60 * 1000,
    limit : 100,
    statusCode : 429,
    message : "Too many request from this IP, please try again later"
})