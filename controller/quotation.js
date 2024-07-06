import getPrismaInstant from "../lib/prisma.js";
const prisma = getPrismaInstant()
import Fuse from 'fuse.js'
export const getQuotation = async  (req,res) =>{
    try{
        const {filter='' ,name='', take='15',page='1' , filter1 = '' , fromDate, toDate} = req.query

        let takenValue = +take;
        let skip = (+page - 1) * takenValue

        const user = await prisma.user.findFirst({
            where:{
                name:name
            }
        })

        let quotations;
        let totalQuotations;
        let totalCal;

        if(user.role === "ADMIN"){
            totalCal = await prisma.quotation.aggregate({
                _sum:{
                    total:true
                },
                where:{
                    AND:[
                        {
                            OR:[
                                {qtNo:{contains:filter ,
                                    mode: 'insensitive'}},
                                {qtTitle:{contains:filter ,
                                    mode: 'insensitive'}},
                                {invCusPhone:{contains:filter , mode:'insensitive'}},
                            ]
                        },
                        filter1 ? {invCusName:{contains:filter1,mode:'insensitive'}} : {},
                        fromDate && toDate ? {
                            OR: [
                                { qtDate: { gte: new Date(fromDate).toISOString(), lte: new Date(toDate).toISOString() } },
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
            quotations = await prisma.quotation.findMany({
                take:takenValue,
                skip,
                where:{
                    AND:[
                        {
                            OR:[
                                {qtNo:{contains:filter,
                                    mode: 'insensitive'}},
                                {qtTitle:{contains:filter,
                                    mode: 'insensitive'}},
                                {invCusPhone:{contains:filter , mode:'insensitive'}}
                            ]
                        },
                        filter1 ? {
                            invCusName:{contains:filter1,mode:'insensitive'}} : {},
                        fromDate && toDate ? {
                            OR: [
                                { qtDate: { gte: new Date(fromDate).toISOString(), lte: new Date(toDate).toISOString() } },
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
            totalQuotations = await prisma.quotation.count({
                where:{
                    AND:[
                        {
                            OR:[
                                {qtNo:{contains:filter,
                                    mode: 'insensitive'}},
                                {qtTitle:{contains:filter,
                                    mode: 'insensitive'}},
                                {invCusPhone:{contains:filter , mode:'insensitive'}},
                            ]
                        },
                        filter1 ? {
                            invCusName:{contains:filter1 , mode:"insensitive"}} : {},
                        fromDate && toDate ? {
                            OR: [
                                { qtDate: { gte: new Date(fromDate).toISOString(), lte: new Date(toDate).toISOString() } },
                                { updatedAt: { gte: new Date(fromDate), lte: new Date(toDate) } }
                            ]
                        } : {},
                    ],
                    deletedAt:null,
                },
            })
        }else{
            quotations = []
            totalCal = []
            for(const busName of user.businessType){
                const quotationTypeCal = await prisma.quotation.aggregate({
                    _sum:{
                        total:true
                    },
                    where:{
                        AND:[
                            {
                                OR:[
                                    {qtNo:{contains:filter,
                                        mode: 'insensitive'}},
                                    {qtTitle:{contains:filter,
                                        mode: 'insensitive'}},
                                        {invCusPhone:{contains:filter , mode:'insensitive'}},
                                ],
                                qtBus:busName
                            },
                            filter1 ? {
                                invCusName:{
                                    contains:filter1,mode:'insensitive'
                                }
                            } : {},
                            fromDate && toDate ? {
                                OR: [
                                    { qtDate: { gte: new Date(fromDate).toISOString(), lte: new Date(toDate).toISOString() } },
                                    { updatedAt: { gte: new Date(fromDate), lte: new Date(toDate) } }
                                ]
                            } : {},
                        ],
                        deletedAt:null,
                    }
                })
                const quotationType = await prisma.quotation.findMany({
                    take:takenValue,
                    skip,
                    where:{
                        AND:[
                            {
                                OR:[
                                    {qtNo:{contains:filter,
                                        mode: 'insensitive'}},
                                    {qtTitle:{contains:filter,
                                        mode: 'insensitive'}},
                                    {invCusPhone:{contains:filter , mode:'insensitive'}},
                                ],
                                qtBus:busName
                            },
                            filter1 ? {
                                invCusName:{
                                    contains:filter1,mode:'insensitive'
                                }} : {},
                            fromDate && toDate ? {
                                OR: [
                                    { qtDate: { gte: new Date(fromDate).toISOString(), lte: new Date(toDate).toISOString() } },
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
                quotations.push(...quotationType)
                totalCal.push(...quotationTypeCal)
            }
            totalQuotations = quotations.length
        }

        const totalFilter = totalCal

        const totalPages = Math.ceil(totalQuotations / takenValue)
        
        return res.status(200).json({
            quotations,
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

export const getallQuote  = async (req,res) =>{
    try{
        const {filter } = req.query

        const qt = await prisma.quotation.findMany({
            where:{
                deletedAt:null
            }
        })
        const fuse = new Fuse(qt , {
            keys:['cusName2'],
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