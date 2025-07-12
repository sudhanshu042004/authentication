import axios from "axios";
import { Router, type Request, type Response } from "express";
import { OAuth2Client } from 'google-auth-library';

const googleAuth = Router();

const oauth2client = new OAuth2Client();
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

googleAuth.post('/', async (req: Request, res: Response) => {
    const code = req.headers.authorization;

    if (!code) {
        res.status(400).json({
            "status": "error",
            "message": "code is missing"
        })
        return;
    }
    try {
        if (!clientId || !clientSecret) {
            throw new Error("credetials missing in enviroment varaible");
        }

        const response = await axios.get(
            'https://oauth2.googleapis.com/token',
            {
                //@ts-ignore
                code,
                client_id: '587301-d27f8hofgi6i0.apps.googleusercontent.com',
                client_secret: 'GOCSPX-u02eNWutQVi',
                redirect_uri: 'postmessage',
                grant_type: 'authorization_code'

            }
        );
        const accessToken = response.data.access_token;
        const userResponse = await axios.get(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      const userDetails = userResponse.data;
      console.log(userDetails);

    } catch (error) {
        console.error('Error saving code:', error);
      res.status(500).json({ 'status' : "error","message": 'Failed to authenticate' });

    }

})

