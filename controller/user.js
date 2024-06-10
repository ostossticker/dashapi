import getPrismaInstant from "../lib/prisma.js"
import filterLowerCasePreserveCase from "../lib/functions.js";

const prisma = getPrismaInstant()

export const getUser = async (req,res) =>{
 try{
    const {filter = '' , taken = "15" , page = '1'} = req.query
    
    const tranformedFilter = filterLowerCasePreserveCase(filter)

    let takenValue = +taken;
    let skip = (+page - 1) * takenValue
    
    const users = await prisma.user.findMany({
        take:takenValue,
        skip,
        where:{
            AND:[
                {
                    OR:[
                        {name:{contains:tranformedFilter}},
                        {email:{contains:tranformedFilter}}
                    ]
                }
            ]
        },
        orderBy:{
            createdAt:'asc'
        }
    })
    const totalUsers = await prisma.user.count()
    const totalPages = Math.ceil(totalUsers / takenValue)
    return res.status(200).json({
        users,
        pagination:{
            page:+page,
            totalPages
        }
    })
 }catch(error){
    return res.status(500).json({msg:error})
 } 
}

export const getSingleUser = async (req,res) =>{
    try{
        const userId = req.params.id
        if(!userId){
            return res.status(404).json({error:"not founded!"})
        }
        const singleUser = await prisma.user.findUnique({
            where:{
                id:Number(userId)
            }
        })
        if(!singleUser){
            return res.status(404).json({error:"single custoemr not founded!"})
        }
        return res.status(200).json(singleUser)
    }catch(error){
        return res.status(500).json({msg:error})
    }
}