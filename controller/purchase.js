import Fuse from "fuse.js";
import getPrismaInstant from "../lib/prisma.js"

const prisma = getPrismaInstant()

export const getPurchase = async (req,res) =>{
 try{
    const { filter = '', take = '5', page = '1', filter1 = '' , fromDate, toDate } = req.query;
    
    let takenValue = +take;
    let skip = (+page - 1) * takenValue
    
    const purchase = await prisma.purchase.findMany({
        take:takenValue,
        skip,
        where:{
            AND:[
                {
                    OR:[
                        {purName:{contains:filter}},
                        {purSupp:{contains:filter}},
                    ]
                },
                filter1 ? {purBus:{contains:filter1}} : {},
                fromDate && toDate ? { createdAt: { gte: new Date(fromDate), lte: new Date(toDate) } } : {},
            ]
        },
        orderBy:{
            createdAt:'asc'
        }
    })
    const totalPurchase = await prisma.purchase.count()
    const totalPages = Math.ceil(totalPurchase / takenValue)
    return res.status(200).json({
        purchase,
        pagination:{
            page:+page,
            totalPages
        }
    })
 }catch(error){
    return res.status(500).json({msg:error})
 } 
}

export const getSinglePurchase = async (req,res) =>{
    try{
        const purId = req.params.id
        if(!purId){
            return res.status(404).json({error:"not founded!"})
        }
        const singlePurchase = await prisma.purchase.findUnique({
            where:{
                id:purId
            }
        })
        if(!singlePurchase){
            return res.status(404).json({error:"single custoemr not founded!"})
        }
        return res.status(200).json({editPur:singlePurchase})
    }catch(error){
        return res.status(500).json({msg:error})
    }
}

export const getallpurs = async (req,res) =>{
    try{
        const {filter} = req.query
        const purss = await prisma.purchase.findMany({})
        const fuse = new Fuse(purss,{
            keys: ['purName', 'purSupp','purBus'],
            threshold: 0.3,
            includeScore: true
        })
        const fuzzyFilteredResults = filter ? fuse.search(filter).map(result => result.item) : purss
        return res.status(200).json(fuzzyFilteredResults);
    }catch(error){
        return res.status(500).json({msg:error})
    }
}