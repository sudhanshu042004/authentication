import jwt, { type JwtPayload } from "jsonwebtoken";

const secret = process.env.JWT_SECRET;

export function tokenGen(payload : {userId : number,email : string}){
    if(!secret){
        throw new Error("No jwt secret found");
    }
    const token =  jwt.sign(payload,secret,{expiresIn : '7d'})
    return token;
}

export function verifyToken(tokenString : string){
    if(!secret){
        throw new Error("No jwt secret found");
    }
    const JwtPayload = jwt.verify(tokenString,secret) as JwtPayload;
    if(!JwtPayload){
        return null;
    }
    return JwtPayload;
}