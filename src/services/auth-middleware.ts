import { NextFunction, Request, Response } from "express";
import {BadRequestError, IAuthPayload, NotAuthorizedError} from '@tarun23-ko/my-upwork-app-shared-module';
import {verify} from 'jsonwebtoken'
import { config } from "@gateway/config";

class AuthMiddleware{

    public verify(req:Request,_res:Response,next:NextFunction):void{
        if(!req?.session?.jwt){
            throw new NotAuthorizedError('Token is not availabe.Please Login again! ','verify Api-Gateway Service() method error')
        }

        try {
            const payload:IAuthPayload = verify(req?.session?.jwt,`${config.JWT_TOKEN}`) as IAuthPayload
            req.currentUser = payload
            
        } catch (error) {
            throw new NotAuthorizedError('Token is not availabe.Please Login again! Invalid Session ','verify Api-Gateway Service() method error')
        }

        next()
    }

    public CheckAuthentication(req:Request,_res:Response,next:NextFunction):void{

        if (!req.currentUser) {
            throw new BadRequestError('Authentication is Required to access this Route','verify Api-Gateway CheckAuthentication() method error')

        }
    }

}

export const authMiddleware:AuthMiddleware = new AuthMiddleware()