import { PrismaClient } from "@prisma/client";

let instance = null

const getPrismaInstant = () =>{
    if(!instance){
        instance = new PrismaClient();
    }

    return instance
}

export default getPrismaInstant

export const measureTime = (
    req,
    res,
    next
  ) => {
    const start = Date.now();
    res.on('finish', () => {
      const end = Date.now();
      const duration = end - start;
      console.log(`[${req.method}] ${req.url} took ${duration}ms`);
    });
    next();
  };