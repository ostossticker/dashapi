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
            createdAt:'asc'
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

export const getAllCustomer = async (req,res)=>{
    try{
        const {filter} =req.query
        const cuss = await prisma.customer.findMany({})
        if(filter){
            const fuse = new Fuse(cuss,{
                keys: ['cusBus'],
                threshold: 0.3,
                includeScore: true
            })
    
            const fuzzyFilteredResults = fuse.search(filter).map(result => result.item) 
            return res.status(200).json(fuzzyFilteredResults);
        }else{
            return res.status(200).json(cuss);
        }
 
      
    }catch(error){
        return res.status(500).json({msg:error})
    }
}