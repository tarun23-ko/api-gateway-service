import express,{Router} from 'express'
import { Health } from '../controllers/health'

class HealthRoutes{
    private router:Router

    constructor(){
        this.router = express.Router()
    }

    public routes():Router{
        this.router.get('/health-gateway',Health.prototype.health)
        return this.router
    }
}

export const healthRoutes: HealthRoutes = new HealthRoutes()
