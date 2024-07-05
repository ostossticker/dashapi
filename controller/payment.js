import { groupByWithInclude } from "../lib/functions.js";
import getPrismaInstant from "../lib/prisma.js"
import Fuse from "fuse.js";
const prisma = getPrismaInstant()


export const getPayData = async (req,res) =>{
    function isNumeric(str) {
        return /^\d+$/.test(str);
    }
    try{
        const {switched , take='15' , name='' ,page='1' , filter='' , filter1='' ,filter2='' , fromDate, toDate} = req.query
        let payment;
        let totalPayments;
        let totalCal;
        let takenValue = +take
        let skip = (+page - 1) * takenValue

        const user = await prisma.user.findFirst({
            where:{
                name:name
            }
        })
        if(user.role === "ADMIN"){
            if(switched === 'ungroup'){
                payment = await prisma.invoice.findMany({
                    take:takenValue,
                    skip,
                    where:{
                        AND:[
                            {
                                    OR:[
                                        {invNo:{contains:filter,
                                            mode: 'insensitive'
                                        }},
                                        {invCusPhone:{contains:filter , mode:'insensitive'}},
                                        {invCusComp:{contains:filter , mode:'insensitive'}},
                                        {invCusName:{contains:filter , mode:'insensitive'}},
                                        {invBus:{contains:filter , 
                                            mode: 'insensitive'}},
                                ]
                            },
                            filter1 ? {invBus:{contains:filter1 , 
                                mode: 'insensitive'}} : {},
                            filter2 ? {invStatus:{contains:filter2 , 
                                mode: 'insensitive'}} : {},
                            fromDate && toDate ? {
                                OR: [
                                    { createdAt: { gte: new Date(fromDate), lte: new Date(toDate) } },
                                    { updatedAt: { gte: new Date(fromDate), lte: new Date(toDate) } }
                                ]
                            } : {},
                        ],
                        mode:'invoice',
                        deletedAt:null
                    },
                    orderBy:{
                        createdAt:'desc'
                    }
                })            
            }else if (switched === 'group'){
              
                  payment = await prisma.invoice.groupBy({
                    take:takenValue,
                    skip,
                    by:['invCusName','invBus','invCusComp'],
                    where:{
                        AND:[
                            {
                                OR:[
                                    {invCusName:{contains:filter,mode:'insensitive'}}
                                ]
                            },
                            filter1 ? {invBus:{contains:filter1 , mode:'insensitive'}} : {},
                            filter2 ? {invStatus:{contains:filter2}} : {},
                        ],
                        mode: 'invoice',
                        deletedAt:null
                    },
                    _count:{
                        invCusName:true
                    },
                    _sum:{
                        balance:true,
                    },
                    orderBy:{
                        invCusName:'asc'
                      }
                  })
              
            }
            if(!payment){
                return res.status(404).json({msg:"sorry not founded!"})
            }
             totalCal = await prisma.invoice.aggregate({
                _sum:{
                    balance:true
                },
                where:{
                    AND:[
                        {
                            OR:[
                                {invNo:{contains:filter,
                                    mode: 'insensitive'
                                }},
                                {invCusPhone:{contains:filter , mode:'insensitive'}},
                                {invCusComp:{contains:filter , mode:'insensitive'}},
                                {invCusName:{contains:filter , mode:'insensitive'}},
                                {invBus:{contains:filter , 
                                    mode: 'insensitive'}},
                            ]
                        },
                        filter1 ? {invBus:{contains:filter1 , 
                            mode: 'insensitive'}} : {},
                        filter2 ? {invStatus:{contains:filter2 , 
                            mode: 'insensitive'}} : {},
                        fromDate && toDate ? {
                            OR: [
                                { createdAt: { gte: new Date(fromDate), lte: new Date(toDate) } },
                                { updatedAt: { gte: new Date(fromDate), lte: new Date(toDate) } }
                            ]
                        } : {},
                    ],
                    mode:'invoice',
                    deletedAt:null
                },
                orderBy:{
                    createdAt:'desc'
                }
            })
            totalPayments = payment.length
        }else{
            totalCal = []
            payment = []
            let paymentbyType;
            for(const busName of user.businessType){
                if(switched === 'ungroup'){
                    paymentbyType = await prisma.invoice.findMany({
                        take:takenValue,
                        skip,
                        where:{
                            AND:[
                                {
                                        OR:[
                                            {invNo:{contains:filter,
                                                mode: 'insensitive'
                                            }},
                                            {invCusPhone:{contains:filter , mode:'insensitive'}},
                                            {invCusComp:{contains:filter , mode:'insensitive'}},
                                             {invCusName:{contains:filter , mode:'insensitive'}},
                                            {invBus:{contains:filter , 
                                                mode: 'insensitive'}},
                                    ],
                                    invBus:busName
                                },
                                filter1 ? {invBus:{contains:filter1 , 
                                    mode: 'insensitive'}} : {},
                                filter2 ? {invStatus:{contains:filter2 , 
                                    mode: 'insensitive'}} : {},
                                fromDate && toDate ? {
                                    OR: [
                                        { createdAt: { gte: new Date(fromDate), lte: new Date(toDate) } },
                                        { updatedAt: { gte: new Date(fromDate), lte: new Date(toDate) } }
                                    ]
                                } : {},
                            ],
                            mode:'invoice',
                            deletedAt:null
                        },
                        orderBy:{
                            createdAt:'desc'
                        }
                    })            
    
                }else if (switched === 'group'){
                    paymentbyType = await prisma.invoice.groupBy({
                        take:takenValue,
                        skip,
                        by:['invCusName','invBus','invCusComp'],
                        where:{
                            AND:[
                                {
                                    OR:[
                                        {invCusName:{contains:filter,mode:'insensitive'}}
                                    ]
                                },
                                filter1 ? {invBus:{contains:filter1 , mode:'insensitive'}} : {},
                                filter2 ? {invStatus:{contains:filter2}} : {},
                            ],
                            invBus:busName,
                            mode: 'invoice',
                            deletedAt:null
                        },
                        _count:{
                            invCusName:true
                        },
                        _sum:{
                            balance:true,
                        },
                        orderBy:{
                            invCusName:'asc'
                          }
                      })
                }
                if(!payment){
                    return res.status(404).json({msg:"sorry not founded!"})
                }
                const totalCalType = await prisma.invoice.aggregate({
                    _sum:{
                        balance:true
                    },
                    where:{
                        AND:[
                            {
                                OR:[
                                    {invNo:{contains:filter,
                                            mode: 'insensitive'
                                        }},
                                        {invCusPhone:{contains:filter , mode:'insensitive'}},
                                    {invCusComp:{contains:filter , mode:'insensitive'}},
                                    {invCusName:{contains:filter , mode:'insensitive'}},
                                    {invBus:{contains:filter , 
                                        mode: 'insensitive'}},
                                ],
                                invBus:busName
                            },
                            filter1 ? {invBus:{contains:filter1 , 
                                mode: 'insensitive'}} : {},
                            filter2 ? {invStatus:{contains:filter2 , 
                                mode: 'insensitive'}} : {},
                            fromDate && toDate ? {
                                OR: [
                                    { createdAt: { gte: new Date(fromDate), lte: new Date(toDate) } },
                                    { updatedAt: { gte: new Date(fromDate), lte: new Date(toDate) } }
                                ]
                            } : {},
                        ],
                        mode:'invoice',
                        deletedAt:null
                    },
                    orderBy:{
                        createdAt:'desc'
                    }
                })
                payment.push(...paymentbyType)
                totalCal.push(...totalCalType)
            }
            totalPayments = payment.length;
        }
        
        const totalV = totalCal
        const totalPages = Math.ceil(totalPayments / takenValue)
        return res.status(200).json({
            totalV,
            payment,
            pagination:{
                page:+page,
                totalPages
            }
        })
    }catch(error){
        console.log(error)
        return res.status(500).json({msg:error})
    }
}

export const getallPayment  = async (req,res) =>{
    try{
        const {filter} = req.query

        const inv = await prisma.invoice.findMany({
            where:{
                mode:'invoice',
                deletedAt:null
            }
        })
        const fuse = new Fuse(inv , {
            keys:['invBus'],
            threshold:0.3,
            includeScore: true
        });
        let fuzzyFilteredResults = inv;

        // Apply filters
        if (filter) {
            fuzzyFilteredResults = fuse.search(filter).map(result => result.item);
        }
        return res.status(200).json(fuzzyFilteredResults);
    }catch(error){
        return res.status(500).json({msg:error})
    }
}

export const ungroupCal = async(req,res) =>{
    try{
        const {name , filter , filter1 , filter2} = req.query
        let total 
        const user = await prisma.user.findFirst({
          where:{
            name:name
          }
        })
        if(user.role === 'ADMIN'){
          total = await prisma.invoice.aggregate({
            _sum:{
                balance:true
            },
            where:{
              AND:[
                  {
                      OR:[
                          {invCusName:{contains:filter,mode:'insensitive'}}
                      ]
                  },
                  filter1 ? {invBus:{contains:filter1 , mode:'insensitive'}} : {},
                  filter2 ? {invStatus:{contains:filter2}} : {},
              ],
              mode: 'invoice',
              deletedAt:null
          },
          })
        }else{
          total = []
          for(const busName of user.businessType){
            const totaling = await prisma.invoice.aggregate({
                _sum:{
                    balance:true
                },
                where:{
                    AND:[
                        {
                            OR:[
                                {invCusName:{contains:filter,mode:'insensitive'}}
                            ]
                        },
                        filter1 ? {invBus:{contains:filter1 , mode:'insensitive'}} : {},
                        filter2 ? {invStatus:{contains:filter2}} : {},
                    ],
                    invBus:busName,
                    mode: 'invoice',
                    deletedAt:null
                },
            })
            total.push(...totaling)
          }
        }
        return res.status(200).json(total)
      }catch(error){
        console.log(error)
        return res.status(500).json({msg:error.message})
      }
}

export const groupingCal = async(req,res) =>{
    try{
        const {name ,filter, filter1 , filter2} = req.query
        
        let total 
        const user = await prisma.user.findFirst({
            where:{
                name:name
            }
        })
        if(user.role === 'ADMIN'){
            total = await prisma.invoice.groupBy({
                by:['invCusName','invBus','invCusComp'],
                where:{
                    AND:[
                        {
                            OR:[
                                {invCusName:{contains:filter,mode:'insensitive'}}
                            ]
                        },
                        filter1 ? {invBus:{contains:filter1 , mode:'insensitive'}} : {},
                        filter2 ? {invStatus:{contains:filter2}} : {},
                    ],
                    mode: 'invoice',
                    deletedAt:null
                },
                _sum:{
                    balance:true,
                }
            })
        }else{
            let total = []
            for(const busName of user.businessType){
                const totaling = await prisma.invoice.groupBy({
                    by:['invCusName','invBus','invCusComp'],
                    where:{
                        AND:[
                            {
                                OR:[
                                    {invCusName:{contains:filter,mode:'insensitive'}}
                                ]
                            },
                            filter1 ? {invBus:{contains:filter1 , mode:'insensitive'}} : {},
                            filter2 ? {invStatus:{contains:filter2}} : {},
                        ],
                        invBus:busName,
                        mode: 'invoice',
                        deletedAt:null
                    },
                    _sum:{
                        balance:true,
                    },
                })
                total.push(...totaling)
            }
        }
        const totalItem = total.reduce((acc , curr)=> acc + curr._sum.balance , 0)
        return res.status(200).json(totalItem)
    }catch(error){
        console.log(error)
        return res.status(500).json({msg:error.message})
    }
}