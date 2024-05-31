import Fuse from "fuse.js";
import getPrismaInstant from "../lib/prisma.js"

const prisma = getPrismaInstant()

export const getCustomer = async (req,res,next) =>{
 try{
    const {filter='', take="5" , page='1',filter1=''} = req.query
    
    let takenValue = +take;
    let skip = (+page - 1) * takenValue
    
    const customers = await prisma.customer.findMany({
        take:takenValue,
        skip,
        where:{
            AND:[
                {
                    OR:[
                        {cusName:{contains:filter}},
                        {cusBus:{contains:filter}}
                    ]
                },
                filter1 ? {cusBus:{contains:filter1}} : {}
            ],
        },
        orderBy:{
            createdAt:'desc'
        }
    })
    const totalCustomer = await prisma.customer.count()
    const totalPages = Math.ceil(totalCustomer / takenValue)
    return res.status(200).json({
        customers,
        pagination:{
            page:+page,
            totalPages
        }
    })
 }catch(error){
    next(error)
    
 } 
}

export const getSingleCustomer = async (req,res) =>{
    try{
        const cusId = req.params.id
        if(!cusId){
            return res.status(404).json({error:"not founded!"})
        }
        const singleCustomer = await prisma.customer.findUnique({
            where:{
                id:cusId
            }
        })
        if(!singleCustomer){
            return res.status(404).json({error:"single custoemr not founded!"})
        }
        return res.status(200).json({editcus:singleCustomer})
    }catch(error){
        return res.status(500).json({msg:error})
    }
}

export const getAllCustomer = async (req,res) =>{
    try{
        const {filter , phone,business} = req.query
        const purss = await prisma.customer.findMany({})
        const fuse = new Fuse(purss,{
            keys: ['cusName','cusPhone1','cusBus'],
            threshold: 0.3,
            includeScore: true
        })
        let fuzzyFilteredResults = purss
        if(filter){
            fuzzyFilteredResults = fuse.search(filter).map(result => result.item) 
        }
        if(phone){
            fuzzyFilteredResults = fuzzyFilteredResults.filter(item => item.cusPhone1.includes(phone))
        }
        if(business){
            fuzzyFilteredResults = fuzzyFilteredResults.filter(item => item.cusBus.includes(business))
        }
        return res.status(200).json(fuzzyFilteredResults);
    }catch(error){
        return res.status(500).json({msg:error})
    }
}