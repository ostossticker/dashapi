import Fuse from "fuse.js";
import getPrismaInstant from "../lib/prisma.js"
import filterLowerCasePreserveCase from "../lib/functions.js";

const prisma = getPrismaInstant()

export const getProduct = async (req,res) =>{
 try{
    const {filter='' ,name = '', take="15" , page='1',filter1=''} = req.query
    
    let takenValue = +take;
    let skip = (+page - 1) * takenValue

    const user = await prisma.user.findFirst({
        where:{
            name:name
        }
    })
    
    let products;
    let totalProduct;
    if(user.role === 'ADMIN'){
        products = await prisma.product.findMany({
            take:takenValue,
            skip,
            where:{
                AND:[
                    {
                        OR:[
                            {prodItemName:{contains:filter , mode: 'insensitive'}},
                        ]
                    },
                    filter1 ? {prodBus:{contains:filter1 , mode: 'insensitive'}} : {}
                ]
            },
            orderBy:{
                prodItemName:'asc'
            }
        })
        totalProduct = await prisma.product.count({
            where:{
                AND:[
                    {
                        OR:[
                            {prodItemName:{contains:filter , mode: 'insensitive'}}
                        ]
                    },
                    filter1 ? {prodBus:{contains:filter1 , mode: 'insensitive'}} : {}
                ]
            }
        })
    }else{
        products = []
        for(const busName of user.businessType){
            const productBytype = await prisma.product.findMany({
                take:takenValue,
                skip,
                where:{
                    AND:[
                        {
                            OR:[
                                {prodItemName:{contains:filter , mode: 'insensitive'}}
                            ],
                            prodBus:busName
                        },
                        filter1 ? {prodBus:{contains:filter1 , mode: 'insensitive'}} : {}
                    ]
                },
                orderBy:{
                    prodItemName:'asc'
                }
            }) 
            products.push(...productBytype)
        }
        totalProduct = products.length
    }

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