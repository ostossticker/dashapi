import Fuse from "fuse.js";
import getPrismaInstant from "../lib/prisma.js"
import filterLowerCasePreserveCase from "../lib/functions.js";

const prisma = getPrismaInstant()

export const getPurchase = async (req,res) =>{
 try{
    const { filter = '', name = '' , take = '15', page = '1', filter1 = '' , fromDate, toDate } = req.query;
    
    const tranformedFilter = filterLowerCasePreserveCase(filter)

    let takenValue = +take;
    let skip = (+page - 1) * takenValue

    const user = await prisma.user.findFirst({
        where:{
            name:name
        }
    })

    let purchase;
    let totalPurchase;
    if(user.role === 'ADMIN'){
        purchase = await prisma.purchase.findMany({
            take:takenValue,
            skip,
            where:{
                AND:[
                    {
                        OR:[
                            {purName:{contains:tranformedFilter}},
                            {purSupp:{contains:tranformedFilter}},
                        ]
                    },
                    filter1 ? {purBus:{contains:filter1}} : {},
                    fromDate && toDate ? { createdAt: { gte: new Date(fromDate), lte: new Date(toDate) } } : {},
                ]
            },
            orderBy:{
                createdAt:'desc'
            }
        })
        totalPurchase = await prisma.purchase.count({
            where:{
                AND:[
                    {
                        OR:[
                            {purName:{contains:tranformedFilter}},
                            {purSupp:{contains:tranformedFilter}},
                        ]
                    },
                    filter1 ? {purBus:{contains:filter1}} : {},
                    fromDate && toDate ? { createdAt: { gte: new Date(fromDate), lte: new Date(toDate) } } : {},
                ]
            }
        })
    }else{
        purchase = []
        for(const busName of user.businessType){
            const purchaseByType = await prisma.purchase.findMany({
                take:takenValue,
                skip,
                where:{
                    AND:[
                        {
                            OR:[
                                {purName:{contains:tranformedFilter}},
                                {purSupp:{contains:tranformedFilter}},
                            ],
                            purBus:busName
                        },
                        filter1 ? {purBus:{contains:filter1}} : {},
                        fromDate && toDate ? { createdAt: { gte: new Date(fromDate), lte: new Date(toDate) } } : {},
                    ]
                },
                orderBy:{
                    createdAt:'desc'
                }
            })
            purchase.push(...purchaseByType)
        }
        totalPurchase = purchase.length
    }
    
    const totalPages = Math.ceil(totalPurchase / takenValue)
    return res.status(200).json({
        purchase,
        pagination:{
            page:+page,
            totalPages
        }
    })
 }catch(error){
    console.log(error)
    return res.status(500).json({msg:error.message})
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
        let fuzzyFilteredResults = purss
        if(filter){
            fuzzyFilteredResults = fuse.search(filter).map(result => result.item) 
        }
        return res.status(200).json(fuzzyFilteredResults);
    }catch(error){
        return res.status(500).json({msg:error})
    }
}