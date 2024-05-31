import getPrismaInstant from "../lib/prisma.js"
import Fuse from 'fuse.js'

const prisma = getPrismaInstant()

export const getReceipt = async(req,res) =>{
    try{
        const {filter='' , page='1' , take='5' , filter1='' , fromDate , toDate} = req.query
        let takenValue = +take
        let skip = (+page - 1) * takenValue

        const receipt = await prisma.receipt.findMany({
            take:takenValue,
            skip,
            where:{
                AND:[
                    {
                        OR:[
                            {recNo:{contains:filter}},
                            {recFrom:{contains:filter}},
                            {recBus:{contains:filter}}
                        ]
                    },
                    filter1 ? { recBus:{contains :filter1}} : {},
                    fromDate && toDate ? {
                        OR: [
                            { createdAt: { gte: new Date(fromDate), lte: new Date(toDate) } },
                            { updatedAt: { gte: new Date(fromDate), lte: new Date(toDate) } }
                        ]
                    } : {},
                ],
                deletedAt:null,
            },
            
            orderBy:{
                updatedAt:'desc'
            }
        })
        const totalrecPages = await prisma.receipt.count()
        const totalPages = Math.ceil(totalrecPages / takenValue)
        return res.status(200).json({
            receipt,
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

export const calculateTotal = async (req,res) =>{
    try{
        const data = await prisma.receipt.findMany({
            where:{
                deletedAt:null
            }
        })
        if(data){
            const total = data.reduce((acc , rec) => acc + rec.usd,0)
            return res.status(200).json(total)
        }
    }catch(error){
        return res.status(500).json({msg:error})
    }
}