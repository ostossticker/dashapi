import getPrismaInstant from "../lib/prisma.js"

const prisma = getPrismaInstant()

export const getNotification = async (req,res) =>{
    const { take='10' } = req.query
    try{
        const takeValue = +take
        const data = await prisma.invoice.findMany({
            take:takeValue,
            where:{
                noti:true,
                deletedAt:null
            },
            orderBy:{
                updatedAt:'desc'
            }
        })
        return res.status(200).json(data)
    }catch(error){
        console.log(error)
        return res.status(500).json({msg:error})
    }
}
