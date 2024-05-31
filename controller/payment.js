import getPrismaInstant from "../lib/prisma.js"
import Fuse from "fuse.js";
const prisma = getPrismaInstant()

export const getPayData = async (req,res) =>{
    try{
        const {switched , take='5',page='1' , filter='' , filter1='' ,filter2='' , fromDate, toDate} = req.query
        let payment;
        let takenValue = +take
        let skip = (+page - 1) * takenValue
        if(switched === 'ungroup'){
            payment = await prisma.invoice.findMany({
                take:takenValue,
                skip,
                where:{
                    AND:[
                        {
                            OR:[
                                {cusName1:{contains:filter}},
                                {invBus:{contains:filter}},
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
                    mode:'invoice',
                    deletedAt:null
                },
                orderBy:{
                    updatedAt:'desc'
                }
            })            
        }else if (switched === 'group'){
            payment = await prisma.invoice.groupBy({
                by:['cusName1' , 'cusComp' , 'invBus' , 'invStatus' , 'invCusPhone1'],
                take:takenValue,
                skip,
                where:{
                    AND:[
                        {
                            OR:[
                                {cusName1:{contains:filter}},
                                {invCusPhone1:{contains:filter}},
                            ]
                        },
                        filter1 ? {invBus:{contains:filter1}} : {},
                        filter2 ? {invStatus:{contains:filter2}} : {},
                        fromDate && toDate ? { updatedDate: { gte: new Date(fromDate), lte: new Date(toDate) } } : {},
                    ],
                    deletedAt:null,
                    mode:'invoice'
                },
                _max: {
                    createdAt: true,
                    updatedAt: true
                },
                _min: {
                    createdAt: true,
                    updatedAt: true
                },
                _sum:{
                    balance:true
                },
                _count:{
                    cusName1:true
                },
                orderBy:{
                    cusName1:'asc'
                }
            })
        }
        if(!payment){
            return res.status(404).json({msg:"sorry not founded!"})
        }
        const totalValue = await prisma.invoice.findMany({
            where:{
                AND:[
                    {
                        OR:[
                            {cusName1:{contains:filter}},
                            {invBus:{contains:filter}},
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
                mode:'invoice',
                deletedAt:null
            },
            orderBy:{
                updatedAt:'desc'
            }
        })
        const totalV = totalValue.reduce((acc ,curr)=>acc + curr.balance , 0)
        const totalPayment = await prisma.invoice.count()
        const totalPages = Math.ceil(totalPayment / takenValue)
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


export const calculateTotal = async (req,res) =>{
    try{
        const data = await prisma.invoice.groupBy({
            by:['mode'],
            _sum:{
                balance:true
            },
            where:{
                deletedAt:null
            }
        })
        if(!data){
            return res.status(404).json({msg:"sorry not founded!"})
        }else{
            return res.status(200).json(data)
        }
    }catch(error){
        return res.status(500).json({msg:error})
    }
}