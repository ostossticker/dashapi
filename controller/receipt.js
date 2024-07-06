import getPrismaInstant from "../lib/prisma.js"
import Fuse from 'fuse.js'
import filterLowerCasePreserveCase from "../lib/functions.js";

const prisma = getPrismaInstant()

export const getReceipt = async(req,res) =>{
    try{
        const {filter='' , page='1' , take='15' , name='' , filter1='' , fromDate , toDate} = req.query

        let takenValue = +take
        let skip = (+page - 1) * takenValue

        const user = await prisma.user.findFirst({
            where:{
                name:name
            }
        })

        let receipts;
        let totalReceipts;
        let totalCal

        if(user.role === 'ADMIN'){
            totalCal = await prisma.receipt.aggregate({
                _sum:{
                    usd:true
                },
                where:{
                    AND:[
                        {
                            OR:[
                                {recNo:{contains:filter,
                                    mode: 'insensitive'}},
                                {recFrom:{contains:filter,
                                    mode: 'insensitive'}}
                            ]
                        },
                        filter1 ? { recBus:{contains :filter1 ,
                            mode: 'insensitive'}} : {},
                        fromDate && toDate ? {
                            OR: [
                                { date: { gte: new Date(new Date(fromDate).setDate(new Date(fromDate).getDate() + 1)).toISOString(), lte: new Date(new Date(toDate).setDate(new Date(toDate).getDate() + 1)).toISOString()} },
                                { updatedAt: { gte: new Date(fromDate), lte: new Date(toDate) } }
                            ]
                        } : {},
                    ],
                    deletedAt:null,
                },
                
                orderBy:{
                    createdAt:'desc'
                }
            })
            receipts = await prisma.receipt.findMany({
                take:takenValue,
                skip,
                where:{
                    AND:[
                        {
                            OR:[
                                {recNo:{contains:filter ,
                                    mode: 'insensitive'}},
                                {recFrom:{contains:filter ,
                                    mode: 'insensitive'}}
                            ]
                        },
                        filter1 ? { recBus:{contains :filter1 ,
                            mode: 'insensitive'}} : {},
                        fromDate && toDate ? {
                            OR: [
                                { date: { gte: new Date(new Date(fromDate).setDate(new Date(fromDate).getDate() + 1)).toISOString(), lte: new Date(new Date(toDate).setDate(new Date(toDate).getDate() + 1)).toISOString()} },
                                { updatedAt: { gte: new Date(fromDate), lte: new Date(toDate) } }
                            ]
                        } : {},
                    ],
                    deletedAt:null,
                },
                
                orderBy:{
                    createdAt:'desc'
                }
            })
            totalReceipts = await prisma.receipt.count({
                where:{
                    AND:[
                        {
                            OR:[
                                {recNo:{contains:filter ,
                                    mode: 'insensitive'}},
                                {recFrom:{contains:filter ,
                                    mode: 'insensitive'}},
                            ]
                        },
                        filter1 ? { recBus:{contains :filter1 ,
                            mode: 'insensitive'}} : {},
                        fromDate && toDate ? {
                            OR: [
                                { date: { gte: new Date(new Date(fromDate).setDate(new Date(fromDate).getDate() + 1)).toISOString(), lte: new Date(new Date(toDate).setDate(new Date(toDate).getDate() + 1)).toISOString()} },
                                { updatedAt: { gte: new Date(fromDate), lte: new Date(toDate) } }
                            ]
                        } : {},
                    ],
                    deletedAt:null,
                },
            })
        }else{
            receipts = []
            totalCal = []
            for(const busName of user.businessType){
                const receiptTotal = await prisma.receipt.aggregate({
                    _sum:{
                        usd:true
                    },
                    where:{
                        AND:[
                            {
                                OR:[
                                    {recNo:{contains:filter ,
                                        mode: 'insensitive'}},
                                    {recFrom:{contains:filter ,
                                        mode: 'insensitive'}}
                                ],
                                recBus:busName
                            },
                            filter1 ? { recBus:{contains :filter1 ,
                                mode: 'insensitive'}} : {},
                            fromDate && toDate ? {
                                OR: [
                                    { date: { gte: new Date(new Date(fromDate).setDate(new Date(fromDate).getDate() + 1)).toISOString(), lte: new Date(new Date(toDate).setDate(new Date(toDate).getDate() + 1)).toISOString()} },
                                    { updatedAt: { gte: new Date(fromDate), lte: new Date(toDate) } }
                                ]
                            } : {},
                        ],
                        deletedAt:null,
                    },
                })
                const receiptByType = await prisma.receipt.findMany({
                    take:takenValue,
                    skip,
                    where:{
                        AND:[
                            {
                                OR:[
                                    {recNo:{contains:filter ,
                                        mode: 'insensitive'}},
                                    {recFrom:{contains:filter ,
                                        mode: 'insensitive'}}
                                ],
                                recBus:busName
                            },
                            filter1 ? { recBus:{contains :filter1 ,
                                mode: 'insensitive'}} : {},
                            fromDate && toDate ? {
                                OR: [
                                    { date: { gte: new Date(new Date(fromDate).setDate(new Date(fromDate).getDate() + 1)).toISOString(), lte: new Date(new Date(toDate).setDate(new Date(toDate).getDate() + 1)).toISOString()} },
                                    { updatedAt: { gte: new Date(fromDate), lte: new Date(toDate) } }
                                ]
                            } : {},
                        ],
                        deletedAt:null,
                    },
                    
                    orderBy:{
                        createdAt:'desc'
                    }
                })
                receipts.push(...receiptByType)
                totalCal.push(...receiptTotal)
            }
            totalReceipts = receipts.length
        }
        const totalFilter = totalCal

        const totalPages = Math.ceil(totalReceipts / takenValue)

        return res.status(200).json({
            receipts,
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

export const getSingleRec = async (req,res) =>{
    try{
        const recId = req.params.id
        if(!recId){
            return res.status(404).json({error:"not founded!"})
        }
        const singleRec = await prisma.receipt.findUnique({
            where:{
                id:recId,
                deletedAt:null
            },
            
        })
        if(!singleRec){
            return res.status(404).json({msg:"single receipt not founded!"});
        }else{
            return res.status(200).json(singleRec)
        }
    }catch(error){
        return res.status(500).json({msg:error})
    }
}

export const getAllRec = async (req,res) =>{
    try{
        const {filter } = req.query

        const rec = await prisma.receipt.findMany({
            where:{
                deletedAt:null
            }
        })
        const fuse = new Fuse(rec , {
            keys:["recBus"],
            threshold:0.3,
            includeScore:true
        })
        let fuzzyFilteredResults = rec

        if(filter){
            fuzzyFilteredResults = fuse.search(filter).map(result => result.item)
        }
        return res.status(200).json(fuzzyFilteredResults)
    }catch(error){
        return res.status(500).json({msg:error})
    }
}