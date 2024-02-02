import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';

function tokenValidator(req: Request, res: Response, next: NextFunction){
    const headerToken = req.headers['authorization'];
    if(typeof headerToken !== 'undefined' && headerToken.startsWith('Bearer ')){
        try {
            const token = headerToken.slice(7);
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY!);
            (req as any).user = decodedToken;
            next();
        } catch (error: any) {
            res.status(400).json({message: 'Invalid or expired token.'})
        }
    }else{
        res.status(400).json({message: 'No token provided. Authorization is needed.'})
    }
}

function restrictToAdmin(req: Request, res: Response, next: NextFunction){
    const user = (req as any).user;
    (user && user.role==='admin') ? next() : res.status(403).json({message: 'Admin privileges are required for this operation.'})
}

export const jwtAuth = {
    tokenValidator,
    restrictToAdmin
}

