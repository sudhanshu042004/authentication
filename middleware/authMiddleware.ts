import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../token/token";

export function verifyUser(req:Request,res:Response,next:NextFunction){
    const cookie = req.headers['cookie'];
    if(!cookie || cookie == ''){
        res.status(401).json({
            'status' : 'error',
            'message' : 'invalid token',
        })
        return;
    }
    
    const tokenString = cookie.split('=')[1]!;
    const userPayload = verifyToken(tokenString);
    if(!userPayload){
        res.status(401).json({
            'status' : 'error',
            'message' : 'invalid token',
        })
        return;
    }
    req.userId = userPayload["userId"];
    req.email = userPayload["email"];

    next();
}