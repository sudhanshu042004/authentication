import axios from "axios";
import { Router, type Request, type Response } from "express";
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';

export const googleAuth = Router();

const oauth2Client = new OAuth2Client();
const clientId = process.env.GOOGLE_CLIENT_ID;
const jwtSecret = process.env.JWT_SECRET;
if(!jwtSecret){
    throw new Error("JWT_SECRET enviroment variable is required");
}

// Token verification endpoint (now handles access tokens)
googleAuth.post('/token', async (req: Request, res: Response) => {
    const { access_token, id_token } = req.body;

    if (!access_token) {
        return res.status(400).json({
            status: "error",
            message: "Access token is missing"
        });
    }

    try {
        if (!clientId) {
            throw new Error("Google client ID missing in environment variables");
        }

        // Verify the ID token if provided (recommended for additional security)
        let googleUser;
        if (id_token) {
            try {
                const ticket = await oauth2Client.verifyIdToken({
                    idToken: id_token,
                    audience: clientId,
                });
                const payload = ticket.getPayload();
                if (payload) {
                    googleUser = {
                        sub: payload.sub,
                        email: payload.email,
                        name: payload.name,
                        picture: payload.picture,
                        given_name: payload.given_name,
                        family_name: payload.family_name,
                        email_verified: payload.email_verified
                    };
                }
            } catch (idTokenError) {
                console.warn('ID token verification failed, falling back to access token:', idTokenError);
            }
        }
        if (!googleUser) {
            const userResponse = await axios.get(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                {
                    headers: {
                        Authorization: `Bearer ${access_token}`
                    }
                }
            );
            googleUser = userResponse.data;
        }

        const user = {
            id: googleUser.sub,
            email: googleUser.email,
            name: googleUser.name,
            picture: googleUser.picture,
            given_name: googleUser.given_name,
            family_name: googleUser.family_name,
            email_verified: googleUser.email_verified?.toString(),
            provider: 'google'
        };

        // Create JWT token for session management
        const token = jwt.sign(
            { 
                userId: user.id, 
                email: user.email 
            }, 
            jwtSecret, 
            { expiresIn: '7d' }
        );

        // Set HTTP-only cookie
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Return user data to frontend
        res.json({
            status: "success",
            user: user,
            message: "Authentication successful"
        });

    } catch (error: any) {
        console.error('Google Auth Error:', error.response?.data || error.message);
        res.status(500).json({ 
            status: "error",
            message: 'Failed to authenticate with Google'
        });
    }
});

// Logout endpoint
googleAuth.post('/logout', async (req: Request, res: Response) => {
    try {
        // Clear cookies
        res.clearCookie('auth_token');
        
        res.json({
            status: "success",
            message: "Logged out successfully"
        });
    } catch (error) {
        console.error('Logout Error:', error);
        res.status(500).json({
            status: "error",
            message: "Failed to logout"
        });
    }
});

// Get current user endpoint
googleAuth.get('/me', verifyAuth, async (req: Request, res: Response) => {
    try {
        // Return user info from JWT token
        res.json({
            status: "success",
            user: {
                id: req.userId,
                email: req.email,
                // You might want to fetch additional user data from database
            }
        });
    } catch (error) {
        res.status(401).json({
            status: "error",
            message: "Not authenticated"
        });
    }
});

// Refresh token endpoint (simplified since we're using JWT)
googleAuth.post('/refresh', verifyAuth, async (req: Request, res: Response) => {
    try {
        // Create new JWT token
        const token = jwt.sign(
            { 
                userId: req.userId, 
                email: req.email 
            }, 
            jwtSecret, 
            { expiresIn: '7d' }
        );

        // Update cookie
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            status: "success",
            message: "Token refreshed successfully"
        });

    } catch (error) {
        console.error('Token Refresh Error:', error);
        res.status(401).json({
            status: "error",
            message: "Failed to refresh token"
        });
    }
});

// Middleware to verify JWT token
export function verifyAuth  (req: Request, res: Response, next: any) {
    const token = req.cookies.auth_token;
    
    if (!token) {
        return res.status(401).json({
            status: "error",
            message: "Authentication required"
        });
    }

    try {
        if(!jwtSecret){
            throw new Error("JWT_SECRET enviroment variable is required");
        }
        const decoded = jwt.verify(token, jwtSecret) as any;
        req.userId = decoded.userId;
        req.email = decoded.email
        next();
    } catch (error) {
        return res.status(401).json({
            status: "error",
            message: "Invalid or expired token"
        });
    }
};