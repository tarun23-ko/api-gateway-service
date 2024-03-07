import express,{ Express } from "express"
import { ApiGateWayServer } from "@gateway/server"

class Application{
public async initialize():Promise<void> {
    const app:Express = express() 
    const GateWayServer: ApiGateWayServer = new ApiGateWayServer(app)
    GateWayServer.start()
}
}

const appliation:Application = new Application()
appliation.initialize()