import { Router, type Request, type Response } from "express";
import { db } from "../src/db";
import { users } from "../src/db/schema";
import { eq } from "drizzle-orm";
import { UpdateUserBody } from "../utils/ZodSchema";
import { id } from "zod/locales";

export const userRoute = Router();

userRoute.get('/', async (req: Request, res: Response) => {
    const { email } = req;
    try {
        const user = await db.select().from(users).where(eq(users.email, email!));
        res.status(200).json({
            "status": "statusOk",
            "message": `users data for ${email}`,
            "data": user[0]
        })
    } catch (error) {
        res.status(500).json({
            "status": "error",
            "message": `error while geting user data`,
        })
    }
})

userRoute.put('/', async (req: Request, res: Response) => {
    const { email, body } = req;
    const { data, error } = UpdateUserBody.safeParse(body);
    if (error || !data) {
        res.status(400).json({
            "status": "error",
            "message": "invalid input"
        })
        return;
    }

    try {

        const existingUser = await db.select().from(users).where(eq(users.email, email!));

        if (!existingUser[0]) {
            throw new Error("couldn't get users data");
        }

        await db.update(users).set({
            name: data.name || existingUser[0].name,
            avatar: data.avatar || existingUser[0].avatar,
            updatedAt : new Date()
        })
        res.status(200).json({
            "status" : "statusOk",
            "message" : "successfully updated user profile"
        })
        return;
    } catch (error) {
        console.error(error);
        res.status(500).json({
            "status": "error",
            "message": "something went wrong"
        })
        return;
    }

})

userRoute.delete('/',async (req:Request,res:Response)=>{
    const {userId} = req;
    if(!userId){
        res.status(401).json({
            "status" : "error",
            "message" : "unauthorize access"
        })
        return;
    }

    try {
        const deletedId = await db.delete(users).where(eq(users.id,userId)).returning({deletedId : users.id});
        res.status(200).json({
            "status": "statusOK",
            "message" : `user of id ${deletedId[0]?.deletedId} deleted successfully`
        })

    } catch (error) {
        
    }
})
