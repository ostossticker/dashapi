import getPrismaInstant from "../lib/prisma.js";
import Fuse from "fuse.js";
const prisma = getPrismaInstant()

export const getInvoice = async  (req,res) =>{
    try{
        const {filter='' , switchMode , take='5',page='1' , filter1='' ,filter2='' , fromDate, toDate} = req.query
        let takenValue = +take;
        let skip = (+page - 1) * takenValue

        const invoice = await prisma.invoice.findMany({
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
                mode:switchMode,
                deletedAt:null
            },
            orderBy:{
                updatedAt:'desc'
            }
        })
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
                mode:switchMode,
                deletedAt:null
            },
            orderBy:{
                updatedAt:'desc'
            }
        })
        const totalFilter = totalValue.reduce((acc , curr) => acc + curr.balance,0)
        const totalInvoicePage = await prisma.invoice.count()
        const totalPages = Math.ceil(totalInvoicePage / takenValue)
        return res.status(200).json({
            invoice,
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