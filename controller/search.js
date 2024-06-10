import getPrismaInstant from "../lib/prisma.js"

const prisma = getPrismaInstant()

export const searchRoute = async (req,res) =>{
    try{
        const {filter} = req.query
        
        const invoice = await prisma.invoice.findMany({
            where:{
                invNo:{contains:filter , mode: 'insensitive'}
            },
            select:{
                invNo:true
            }
        })
        const quotation = await prisma.quotation.findMany({
            where:{
                qtNo:{contains:filter , mode: 'insensitive'}
            },
            select:{
                qtNo:true
            }
        })
        const receipt = await prisma.receipt.findMany({
            where:{
                recNo:{contains:filter, mode: 'insensitive'}
            },
            select:{
                recNo:true
            }
        })
        return res.status(200).json({inv:invoice , qt:quotation , rec:receipt})
    }catch(error){
        console.log(error)
        return res.status(500).json({msg:error.message})
    }
}