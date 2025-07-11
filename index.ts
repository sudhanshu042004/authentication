import express, { type Request, type Response } from "express";
import { auth } from "./router/auth";

const port = parseInt(process.env.PORT!) || 3000;
const app = express();
app.use(express.json());

app.get('/',(req : Request,res:Response)=>{
    res.status(200).json({"message": "you have pinged the server"});
})

app.use("/api/auth",auth);

app.listen(port,()=>{
    console.log(`server has been started at ${port}`)
})