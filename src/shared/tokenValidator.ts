import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';

export function tokenValidator(req: Request, res: Response, next: NextFunction){

    const headerToken = req.headers['authorization'];
    if(headerToken  && headerToken.startsWith('Bearer ')){
        try {
            
            
            
            const token = headerToken.slice(7);
            const isValidToken = jwt.verify(token, process.env.JWT_SECRET_KEY!);
            console.log(isValidToken);
            next();
        } catch (error: any) {
            res.status(400).json({message: 'Invalid or expired token.'})
        }
    }else{
        res.status(400).json({message: 'Authorization is needed.'})
    }


}