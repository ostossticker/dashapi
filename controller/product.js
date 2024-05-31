import Fuse from "fuse.js";
import getPrismaInstant from "../lib/prisma.js"

const prisma = getPrismaInstant()

export const getProduct = async (req,res) =>{
 try{
    const {filter='' , take="5" , page='1',filter1=''} = req.query
    
    let takenValue = +take;
    let skip = (+page - 1) * takenValue
    
    const products = await prisma.product.findMany({
        take:takenValue,
        skip,
        where:{
            AND:[
                {
                    OR:[
                        {prodItemName:{contains:filter}},
                        {prodBus:{contains:filter}}
                    ]
                },
                filter1 ? {prodBus:{contains:filter1}} : {}
            ]
        },
        orderBy:{
            createdAt:'desc'
        }
    })
    const totalProduct = await prisma.product.count()
    const totalPages = Math.ceil(totalProduct / takenValue)
    return res.status(200).json({
        products,
        pagination:{
            page:+page,
            totalPages
        }
    })
 }catch(error){
    return res.status(500).json({msg:error})
 } 
}

export const getSingleProduct = async (req,res) =>{
    try{
        const prodId = req.params.id
        if(!prodId){
            return res.status(404).json({error:"not founded!"})
        }
        const singleProduct = await prisma.product.findUnique({
            where:{
                id:prodId
            }
        })
        if(!singleProduct){
            return res.status(404).json({error:"single custoemr not founded!"})
        }
        return res.status(200).json({editProduct:singleProduct})
    }catch(error){
        return res.status(500).json({msg:error})
    }
}

export const getAllProducts = async (req,res) =>{
    try{
        const {filter} = req.query
        const prods = await prisma.product.findMany({})
        const fuse = new Fuse(prods,{
            keys:['prodItemName','prodBus'],
            threshold:0.3,
            includeScore:true
        })
        const fuzzyFilteredResults = filter ? fuse.search(filter).map(result => result.item) : prods
        return res.status(200).json(fuzzyFilteredResults)
    }catch(error){
        return res.status(500).json({msg:error})
    }
}