import getPrismaInstant from "../lib/prisma.js";
import Fuse from "fuse.js";
const prisma = getPrismaInstant()

function isNumeric(str) {
    return /^\d+$/.test(str);
}


export const getInvoice = async  (req,res) =>{
    try{
        const {filter='' , switchMode , take='15',page='1' , filter1='', name='' ,filter2='' , fromDate, toDate} = req.query
        let takenValue = +take;
        let skip = (page - 1) * takenValue

        const user = await prisma.user.findFirst({
            where:{
                name:name
            }
        })

        let invoices;
        let totalInvoices;
        let invoiceTotal
        if(user.role === "ADMIN"){
            invoiceTotal = await prisma.invoice.findMany({
                    where:{
                        AND:[
                            {
                                OR:[
                                    {invNo:{contains:filter , mode: 'insensitive'}},
                                    {invTitle:{contains:filter , mode: 'insensitive'}},
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
                                    }
                                ]
                            },
                            filter1 ? {invBus:{contains:filter1}} : {},
                            filter2 ? {invStatus:{contains:filter2}} : {},
                            fromDate && toDate ? {
                                OR: [
                                    { createdAt: { gte: new Date(fromDate), lte: new Date(toDate) } },
                                    { updatedAt: { gte: new Date(fromDate), lte: new Date(toDate) } }
                                ]
                            } : {},
                        ],
                        mode:switchMode,
                        deletedAt:null
                    },
                    include:{
                        customer:{
                            select:{
                                cusName:true
                            }
                        }
                    },
                    orderBy:{
                        createdAt:'desc'
                    }
                })
            invoices = await prisma.invoice.findMany({
                take:takenValue,
                skip,
                where:{
                    AND:[
                        {
                            OR:[
                                {invNo:{contains:filter , mode: 'insensitive'}},
                                {invTitle:{contains:filter , mode: 'insensitive'}},
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
                                }
                            ]
                        },
                        filter1 ? {invBus:{contains:filter1}} : {},
                        filter2 ? {invStatus:{contains:filter2}} : {},
                        fromDate && toDate ? {
                            OR: [
                                { createdAt: { gte: new Date(fromDate), lte: new Date(toDate) } },
                                { updatedAt: { gte: new Date(fromDate), lte: new Date(toDate) } }
                            ]
                        } : {},
                    ],
                    mode:switchMode,
                    deletedAt:null
                },
                include:{
                    customer:{
                        select:{
                            cusName:true
                        }
                    }
                },
                orderBy:{
                    createdAt:'desc'
                }
            })
            totalInvoices = await prisma.invoice.count({
                where:{
                    AND:[
                        {
                            OR:[
                                {invNo:{contains:filter,
                                    mode: 'insensitive'
                                }},
                                {invTitle:{contains:filter,
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
                                }
                            ]
                        },
                        filter1 ? {invBus:{contains:filter1}} : {},
                        filter2 ? {invStatus:{contains:filter2}} : {},
                        fromDate && toDate ? {
                            OR: [
                                { createdAt: { gte: new Date(fromDate), lte: new Date(toDate) } },
                                { updatedAt: { gte: new Date(fromDate), lte: new Date(toDate) } }
                            ]
                        } : {},
                    ],
                    mode:switchMode,
                    deletedAt:null
                },
            })
        }else{
            invoiceTotal = []
            invoices = [];
            for(const busName of user.businessType){
                const invoiceBytypeTotal = await prisma.invoice.findMany({
                    where:{
                        AND:[
                            {
                                OR:[
                                    {invNo:{contains:filter,
                                        mode: 'insensitive'
                                    }},
                                    {invTitle:{contains:filter,
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
                                    }
                                ],
                                invBus:busName
                            },
                            filter1 ? {invBus:{contains:filter1}} : {},
                            filter2 ? {invStatus:{contains:filter2}} : {},
                            fromDate && toDate ? {
                                OR: [
                                    { createdAt: { gte: new Date(fromDate), lte: new Date(toDate) } },
                                    { updatedAt: { gte: new Date(fromDate), lte: new Date(toDate) } }
                                ]
                            } : {},
                        ],
                        mode:switchMode,
                        deletedAt:null
                    },
                    include:{
                        customer:{
                            select:{
                                cusName:true
                            }
                        }
                    },
                })
                const invoiceByType = await prisma.invoice.findMany({
                    take:takenValue,
                    skip,
                    where:{
                        AND:[
                            {
                                OR:[
                                    {invNo:{contains:filter,
                                        mode: 'insensitive'
                                    }},
                                    {invTitle:{contains:filter,
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
                                    }
                                ],
                                invBus:busName
                            },
                            filter1 ? {invBus:{contains:filter1}} : {},
                            filter2 ? {invStatus:{contains:filter2}} : {},
                            fromDate && toDate ? {
                                OR: [
                                    { createdAt: { gte: new Date(fromDate), lte: new Date(toDate) } },
                                    { updatedAt: { gte: new Date(fromDate), lte: new Date(toDate) } }
                                ]
                            } : {},
                        ],
                        mode:switchMode,
                        deletedAt:null
                    },
                    include:{
                        customer:{
                            select:{
                                cusName:true
                            }
                        }
                    },
                    orderBy:{
                        createdAt:'desc'
                    }
                })
                invoices.push(...invoiceByType)
                invoiceTotal.push(...invoiceBytypeTotal)
            }
            totalInvoices = invoices.length;
        }
       
        const totalFilter = invoiceTotal.reduce((acc , curr) => acc + curr.balance,0)
        
        const totalPages = Math.ceil(totalInvoices / takenValue)

        return res.status(200).json({
            invoices,
            totalFilter,
            pagination:{
                page:+page,
                totalPages
            }
        })
    }catch(error){
        
        return res.status(500).json({msg:error})
    }
}






export const getSingleInvoice = async (req,res) =>{
    try{
        const invId = req.params.id
        if(!invId){
            return res.status(404).json({error:"not founded!"})
        }
        const singleInvoice = await prisma.invoice.findUnique({
            where:{
                id:invId,
                deletedAt:null
            },
            include:{
                customer:{
                    select:{
                        cusName:true,
                        cusComp:true,
                        cusPhone1:true,
                        cusEmail:true,
                        cusAddr:true
                    }
                }
            }
        })
        if(!singleInvoice){
            return res.status(404).json({error:"single invoice not founded!"})
        }else{
            return res.status(200).json(singleInvoice)
        }
    }catch(error){
        return res.status(500).json({msg:error})
    }
}

export const getallInvoice  = async (req,res) =>{
    try{
        const {filter , mode} = req.query

        const inv = await prisma.invoice.findMany({
            where:{
                mode:mode,
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