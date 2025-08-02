import express, { type Request, type Response } from "express";
import { auth } from "./router/auth";
import { verifyUser } from "./middleware/authMiddleware";
import { userRoute } from "./router/user";
import cors from "cors";
import { googleAuth } from "./router/google";
import { limitMiddleWare } from "./middleware/RateLimiter";

const port = parseInt(process.env.PORT!) || 3000;
const app = express();

app.use(cors());
app.use(express.json());

app.use(limitMiddleWare)
app.get('/',(req : Request,res:Response)=>{
    res.status(200).json({"message": "you have pinged the server"});
})

app.use("/api/auth",auth);
app.use(verifyUser);
app.use('/api/user',userRoute);
app.use('/api/auth/google',googleAuth);

app.listen(port,()=>{
    console.log(`server has been started at ${port}`)
})