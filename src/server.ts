import {CustomError, IErrorResponse, winstonLogger} from '@tarun23-ko/my-upwork-app-shared-module'
import cookieSession from 'cookie-session'
import type {Application,Request, Response,NextFunction} from 'express';
import { json, urlencoded} from 'express'
import cors from 'cors'
import hpp from 'hpp'
import { Logger } from 'winston'
import helmet from 'helmet'
import compression from 'compression'
import { StatusCodes } from 'http-status-codes'
import http from 'http'
import { config } from '@gateway/config';
import { elasticSearch } from '@gateway/elasticsearch';
import { appRoutes } from '@gateway/routes';

const SERVER_PORT = 5000

const log:Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`,'apiGateway','debug')

export class ApiGateWayServer{
    private app:Application
    
    constructor(app:Application){
        this.app = app
    }

    public start():void{
        this.securityMiddleware(this.app);
        this.standardMiddleware(this.app);
        this.routesMiddleware(this.app);
        this.startElascticSearch();
        this.errorHandler(this.app);
        this.startServer(this.app);
    }

    private securityMiddleware(app:Application):void{
        app.set('trust proxy',1)
        app.use(
            cookieSession({
                name:'app-session',
                keys:[`${config.SECRET_KEY_ONE}`,`${config.SECRET_KEY_TWO}`],
                maxAge:24*7*3600000,
                secure:config.NODE_ENV!='develpment'?true:false
                //sameSite:none
            })
        )
        app.use(hpp())
        app.use(helmet())
        app.use(cors(
            {
                origin:config.CLIENT_URL,
                credentials:true,
                methods:['GET','POST','PUT','DELETE','OPTIONS'],
            }
        ))
    }

    private standardMiddleware(app:Application):void{
       app.use(compression())
       app.use(json({limit:'200mb'}))
       app.use(urlencoded({extended:true,limit:'200mb'}))
    }


    private routesMiddleware(app:Application):void{
        appRoutes(app)
    }

    private startElascticSearch():void{

        elasticSearch.CheckConnection()
    }

    private errorHandler(app:Application):void{
        app.use('*',(req:Request,res:Response,next:NextFunction)=>{
            const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
            log.log('error', `${fullUrl} endpoint does not exist.`, '');
            res.status(StatusCodes.NOT_FOUND).json({ message: 'The endpoint called does not exist.'});
            next();

        })

        app.use((error:IErrorResponse,_req:Request,res:Response,next:NextFunction)=>{
            log.log('error', `GatewayService ${error.comingFrom}`, '');
            if (error instanceof CustomError) {
                res.status(error.statusCode).json(error.serializeErrors());
            }
           
            next();

        })

    }

    private async startServer(app:Application):Promise<void>{
        try {
            const httpServer:http.Server = new http.Server(app)
            this.startHttpServer(httpServer)
        } catch (error) {
            log.log('','Gateway service Server() error',error)
        }
    }

    private startHttpServer(httpServer:http.Server){
        try {
            log.info(`Worker process with id of ${process.pid} on gateway server`)
            httpServer.listen(SERVER_PORT,()=>{
                log.info(`Gateway server running on port: ${SERVER_PORT}`)
            })
        } catch (error) {
            log.log('','Gateway service Server() error',error)
        }
    }



}