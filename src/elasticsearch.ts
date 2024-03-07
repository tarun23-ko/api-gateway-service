import { winstonLogger } from "@tarun23-ko/my-upwork-app-shared-module";
import { Logger } from "winston";
import { config } from "@gateway/config";
import {Client} from '@elastic/elasticsearch'
import  { ClusterHealthResponse } from "@elastic/elasticsearch/lib/api/types";


const log:Logger = winstonLogger(`${config.CLIENT_URL}`,'apiGateway','debug')

class ElasticSearch{

    private elasticSearchClient: Client;

    constructor(){
        this.elasticSearchClient = new Client({
            node:`${config.ELASTIC_SEARCH_URL}`
        })
    }

    public async CheckConnection():Promise<void>{
        let  isConnected = false
        while (!isConnected) {
            
            log.info('Gateway Service Connecting to search')
            try {
                const health: ClusterHealthResponse = await this.elasticSearchClient.cluster.health({})
                log.info('Gateway Service Connecting to search - '+health.status)
                isConnected =true
            } catch (error) {
                log.error('Connection to rlastic Search failed.. Retrying')
                log.log('error','Gateway service Server() error',error)
                
            }
            
        }
    }


}

export const elasticSearch:ElasticSearch = new ElasticSearch()