import getPrismaInstant from "../lib/prisma.js";
import Fuse from 'fuse.js'
const prisma = getPrismaInstant()

export const getQuotation = async  (req,res) =>{
    try{
        const {filter = '' , take='5',page='1' , filter1 = '' , fromDate, toDate} = req.query
        let takenValue = +take;
        let skip = (+page - 1) * takenValue

        const quotation = await prisma.quotation.findMany({
            take:takenValue,
            skip,
            where:{
                AND:[
                    {
                        OR:[
                            {qtNo:{contains:filter}},
                            {qtTitle:{contains:filter}},
                            {cusName2:{contains:filter}},
                            {cusPhone2:{contains:filter}}
                        ]
                    },
                    filter1 ? {cusName2:{contains:filter1}} : {},
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
        const totalqtPage = await prisma.invoice.count()
        const totalPages = Math.ceil(totalqtPage / takenValue)
        return res.status(200).json({
            quotation,
            pagination:{
                page:+page,
                totalPages
            }
        })
    }catch(error){
        return res.status(500).json({msg:error})
    }
}

export const getSingleQuotation = async (req,res) =>{
    try{
        const qtId = req.params.id
        if(!qtId){
            return res.status(404).json({error:"not founded!"})
        }
        const singleQuotation = await prisma.quotation.findUnique({
            where:{
                id:qtId,
                deletedAt:null
            }
        })
        if(!singleQuotation){
            return res.status(404).json({error:"single invoice not founded!"})
        }else{
            return res.status(200).json(singleQuotation)
        }
    }catch(error){
        return res.status(500).json({msg:error})
    }
}

export const getallQuote  = async (req,res) =>{
    try{
        const {filter } = req.query

        const qt = await prisma.quotation.findMany({
            where:{
                deletedAt:null
            }
        })
        const fuse = new Fuse(qt , {
            keys:['qtBus'],
            threshold:0.3,
            includeScore: true
        });
        let fuzzyFilteredResults = qt;

        // Apply filters
        if (filter) {
            fuzzyFilteredResults = fuse.search(filter).map(result => result.item);
        }
        return res.status(200).json(fuzzyFilteredResults);
    }catch(error){
        return res.status(500).json({msg:error})
    }
}


export const calculateTotal = async(req,res) =>{
    try{
        const data = await prisma.quotation.findMany({
            where:{
                deletedAt:null
            }
        })
        if(data){
            const total = data.reduce((acc , rec)=>acc + rec.total,0)
            return res.status(200).json(total)
        }
    }catch(error){
        return res.status(500).json({msg:error})
    }
}