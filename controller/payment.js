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
                                        isNumeric(filter) ? 
                                        {
                                            customer:{
                                                cusPhone1:{
                                                    contains:filter, 
                                                    mode: 'insensitive'
                                                },
                                                
                                            }
                                        } : {
                                            customer:{
                                                cusName:{
                                                    contains:filter, 
                                                    mode: 'insensitive'
                                                }
                                                
                                            }
                                        },
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
                    include:{
                        customer:{
                            select:{
                                cusName:true,
                                cusComp:true,
                                cusPhone1:true
                            }
                        }
                    },
                    orderBy:{
                        createdAt:'desc'
                    }
                })            
            }else if (switched === 'group'){
                const invoices = await prisma.invoice.findMany({
                    where:{
                        AND:[
                            {
                                OR:[
                                     {
                                      customer:{
                                          cusName:{
                                              contains:filter,
                                              mode: 'insensitive'
                                          }
                                      }
                                    }
                                ]
                            },
                            filter1 ? {invBus:{contains:filter1}} : {},
                            { deletedAt: null },
                            { mode: 'invoice' }
                        ]
                    },
                    include: {
                      customer: true,
                    },
                    orderBy: {
                      invDate: 'asc', // Optional: Order by invoice date if needed
                    },
                  });
              
                  // Create a map to group invoices by cusName and invBus
                  const groupedInvoices = invoices.reduce((acc, invoice) => {
                    const key = `${invoice.customer.cusName}_${invoice.invBus}`;
                    if (!acc[key]) {
                      acc[key] = {
                        cusName: invoice.customer.cusName,
                        cusComp: invoice.customer.cusComp || '', // Assuming cusComp is optional
                        invBus: invoice.invBus,
                        count: 0,
                        total: 0, // Assuming cusPhone1 is the phone number
                      };
                    }
              
                    // Accumulate count and total
                    acc[key].count++;
                    acc[key].total += invoice.total || 0;
              
                    return acc;
                  }, {});
              
                  // Convert object map to array and format the result as needed
                payment = Object.values(groupedInvoices).map((item) => ({
                    cusName1: item.cusName,
                    cusComp: item.cusComp,
                    invBus: item.invBus,
                    cusNameCount: item.count,
                    _sum: {
                        balance:item.total
                    },
                  }));
              
            }
            if(!payment){
                return res.status(404).json({msg:"sorry not founded!"})
            }
             totalCal = await prisma.invoice.findMany({
                where:{
                    AND:[
                        {
                            OR:[
                                {invNo:{contains:filter,
                                    mode: 'insensitive'
                                }},
                                {invCusPhone:{contains:filter , mode:'insensitive'}},
                                isNumeric(filter) ? 
                                {
                                    customer:{
                                        cusPhone1:{
                                            contains:filter, 
                                            mode: 'insensitive'
                                        },
                                        
                                    }
                                } : {
                                    customer:{
                                        cusName:{
                                            contains:filter, 
                                            mode: 'insensitive'
                                        }
                                        
                                    }
                                },
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
                                            isNumeric(filter) ? 
                                            {
                                                customer:{
                                                    cusPhone1:{
                                                        contains:filter, 
                                                        mode: 'insensitive'
                                                    },
                                                    
                                                }
                                            } : {
                                                customer:{
                                                    cusName:{
                                                        contains:filter, 
                                                        mode: 'insensitive'
                                                    }
                                                    
                                                }
                                            },
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
                        include:{
                            customer:{
                                select:{
                                    cusName:true,
                                    cusComp:true,
                                    cusPhone1:true
                                }
                            }
                        },
                        orderBy:{
                            createdAt:'desc'
                        }
                    })            
    
                }else if (switched === 'group'){
                    const invoices = await prisma.invoice.findMany({
                        where:{
                            AND:[
                                {
                                    OR:[
                                         {
                                          customer:{
                                              cusName:{
                                                  contains:filter,
                                                  mode: 'insensitive'
                                              }
                                          }
                                        }
                                    ],
                                    invBus:busName
                                },
                                filter1 ? {invBus:{contains:filter1}} : {},
                                { deletedAt: null },
                                { mode: 'invoice' }
                            ],
                            invBus:busName
                        },
                        include: {
                          customer: true,
                        },
                        orderBy: {
                          invDate: 'asc', // Optional: Order by invoice date if needed
                        },
                      });
                  
                      // Create a map to group invoices by cusName and invBus
                      const groupedInvoices = invoices.reduce((acc, invoice) => {
                        const key = `${invoice.customer.cusName}_${invoice.invBus}`;
                        if (!acc[key]) {
                          acc[key] = {
                            cusName: invoice.customer.cusName,
                            cusComp: invoice.customer.cusComp || '', // Assuming cusComp is optional
                            invBus: invoice.invBus,
                            count: 0,
                            total: 0, // Assuming cusPhone1 is the phone number
                          };
                        }
                  
                        // Accumulate count and total
                        acc[key].count++;
                        acc[key].total += invoice.total || 0;
                  
                        return acc;
                      }, {});
                  
                      // Convert object map to array and format the result as needed
                    paymentbyType = Object.values(groupedInvoices).map((item) => ({
                        cusName1: item.cusName,
                        cusComp: item.cusComp,
                        invBus: item.invBus,
                        cusNameCount: item.count,
                        _sum: {
                            balance:item.total
                        },
                      }));
                }
                if(!payment){
                    return res.status(404).json({msg:"sorry not founded!"})
                }
                const totalCalType = await prisma.invoice.findMany({
                    where:{
                        AND:[
                            {
                                OR:[
                                    {invNo:{contains:filter,
                                            mode: 'insensitive'
                                        }},
                                        {invCusPhone:{contains:filter , mode:'insensitive'}},
                                    isNumeric(filter) ? 
                                    {
                                        customer:{
                                            cusPhone1:{
                                                contains:filter, 
                                                mode: 'insensitive'
                                            },
                                            
                                        }
                                    } : {
                                        customer:{
                                            cusName:{
                                                contains:filter, 
                                                mode: 'insensitive'
                                            }
                                            
                                        }
                                    },
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
        
        const totalV = totalCal.reduce((acc ,curr)=>acc + curr.balance , 0)
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

export const payPaid = async (req,res) =>{
    
    try{
        const {name} = req.query
        let total
        const user = await prisma.user.findFirst({
            where:{
                name:name
            }
        })
        if(user.role === "ADMIN"){
            total = await prisma.invoice.groupBy({
                by:['invStatus'],
                where:{
                    mode:'invoice',
                    deletedAt:null
                },
                _sum:{
                    balance:true
                }
            })
        }else{
            total = []
            for(const busName of user.businessType){
                const invTotal = await prisma.invoice.groupBy({
                    by:['invStatus'],
                    where:{
                        mode:'invoice',
                        deletedAt:null,
                        invBus:busName
                    },
                    _sum:{
                        balance:true
                    }
                })
                total.push(...invTotal)
            }
        }
        
        return res.status(200).json(total)
    }catch(error){
        console.log(error)
        return res.status(500).json({msg:error.message})
    }
}