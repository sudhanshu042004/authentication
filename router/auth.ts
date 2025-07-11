import { Router, type Request, type Response } from "express";
import { LoginBody, SignUpBody } from "../types/ZodSchema";
import { db } from "../src/db";
import { userProviders, users } from "../src/db/schema";
import { and, eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { tokenGen } from "../token/token";

export const auth = Router();

auth.post('/signup', async (req: Request, res: Response) => {
    const body = req.body;

    const { data, error } = SignUpBody.safeParse(body);

    if (error || !data) {
        console.error("error while validation user", error);
        res.status(400).json({ "status": "error", "message": "Invalid Credentials" });
        return;
    }

    try {
        const existingUser = await db.select().from(userProviders).where(and(eq(userProviders.provider, 'email'), eq(userProviders.providerUserId, data.email)));

        if (existingUser.length > 0) {
            res.status(401).json({ "status": "error", "message": "Email already exists" });
            return;
        }

        const hashPassword = await bcrypt.hash(data.password, 10);

        const newUser = await db.insert(users).values({
            name: data.name,
            email: data.email,
        }).returning({ usersId: users.id});

        if (!newUser[0]?.usersId) {
            res.status(500).json({ "status": "error", "message": "something went wrong!!!" })
            return;
        }

        await db.insert(userProviders).values({
            provider: 'email',
            providerUserId: data.email,
            passwordHash: hashPassword,
            usersId: newUser[0].usersId
        })

        const token = tokenGen({userId: newUser[0].usersId,email : data.email});
        res.cookie('session',token);
        res.status(200).json({ "status": "success", "message": "usesr created successfully",'cookie':token});
        return;
    }catch(err){
        console.error('error while creating user',err);
        res.status(500).json({ "status": "error", "message": "something went wrong!!!" });
        return;
    }

})


auth.post('/login',async (req:Request,res:Response)=>{
    const body = req.body;

    //input validation
    const {data,error} = LoginBody.safeParse(body);
    if(error || !data){
        console.error('validation error',data);
        res.status(400).json({ "status": "error", "message": "Invalid Credentials" });
        return;
    }

    try {

        const existingUser = await db.select().from(userProviders).where(and(eq(userProviders.provider , 'email'),eq(userProviders.providerUserId,data.email)));
        if(!existingUser || !existingUser[0]?.passwordHash){
            res.status(404).json({'status':"error","message" : "email doesn't exists"});
            return;
        }

        const isValid = await bcrypt.compare(data.password,existingUser[0].passwordHash)
        if(!isValid){
            res.status(401).json({'status':'error','message': "Invalid password"});
        }

        const user = await db.select().from(users).where(eq(users.email,data.email));
        res.status(200).json({'status' : "statusOk",'message' : "successfully login", 'data' : user[0]});
        return;
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ "status": "error", "message": "something went wrong!!!" });
    }
})