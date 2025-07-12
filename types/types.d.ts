import type { LoginBody } from "../utils/ZodSchema";
import { Request } from "express";

type Login = z.infer<typeof LoginBody>

type User = {
    id : number,
    email : string,
    name : string,
    avatar : string | undefined,
    isVerified : boolean,
    role? : string,
    createdAt : string | Date,
    updatedAt : string | Date,
}


declare module 'express-serve-static-core' {
    interface Request{
        userId? : number,
        email? : string
    }
}