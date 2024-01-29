import { Router } from 'express';
import {login, signUp} from './user.controler.js';
import { tokenValidator } from '../shared/tokenValidator.js';

export const userRouter = Router();

userRouter.post('/signup', signUp);
userRouter.post('/login', login);