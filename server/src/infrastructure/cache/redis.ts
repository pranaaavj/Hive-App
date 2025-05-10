import Redis from "ioredis";

export class RedisClient{
    public client:Redis

    constructor(){
        this.client = new Redis({host:'localhost',port:6379})
    }

    async get(key:string):Promise<string|null>{
        return await this.client.get(key)
    }
    async setEx(key:string,value:string,ttl:number):Promise<void>{
        await this.client.setex(key,ttl,value)
    }
}