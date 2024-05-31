import Fuse from "fuse.js";
import getPrismaInstant from "../lib/prisma.js"

const prisma = getPrismaInstant()

export const getBusiness = async (req,res,next) =>{
 try{
    const {filter='', take="5" , page='1'} = req.query
    
    let takenValue = +take;
    let skip = (+page - 1) * takenValue
    
    const buses = await prisma.business.findMany({
        take:takenValue,
        skip,
        where:{
            AND:[
                {
                    OR:[
                        {busName:{contains:filter}},
                        {busEmail:{contains:filter}}
                    ]
                },
            ],
        },
        orderBy:{
            createdAt:'desc'
        }
    })
    const totalBusiness = await prisma.business.count()
    const totalPages = Math.ceil(totalBusiness / takenValue)
    return res.status(200).json({
        buses,
        pagination:{
            page:+page,
            totalPages
        }
    })
 }catch(error){
    next(error)
    
 } 
}

export const getSingleBusiness = async (req,res) =>{
    try{
        const busId = req.params.id
        if(!busId){
            return res.status(404).json({error:"not founded!"})
        }
        const singleBusiness = await prisma.business.findUnique({
            where:{
                id:busId
            }
        })
        if(!singleBusiness){
            return res.status(404).json({error:"single custoemr not founded!"})
        }
        return res.status(200).json({editbus:singleBusiness})
    }catch(error){
        return res.status(500).json({msg:error})
    }
}

export const getAllBusiness = async (req,res) =>{
    try{
        const { filter } = req.query
        const buss = await prisma.business.findMany({})
       
            const fuse = new Fuse(buss, {
                keys: ['busName'],
                threshold: 0.3,
                includeScore: true
            });
            let fuzzyFilteredResults = buss
            if (filter) {
                fuzzyFilteredResults = fuse.search(filter).map(res => res.item);
            }
            return res.status(200).json(fuzzyFilteredResults);
    }catch(error){
        return res.status(500).json({msg:error})
    }
}