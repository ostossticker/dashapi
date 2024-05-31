import getPrismaInstant from "../lib/prisma.js"

const prisma = getPrismaInstant()

export const CheckUserIsValid = async(req,res,next) =>{
    try{
        const { email } = req.query
        if(!email){
            return res.status(401).json({error:"forbidden!"})
        }
        const user = await prisma.user.findUnique({
            where:{
               id:email
            }
        })
        if(!user){
            return res.status(404).json({error:"user doesnt exist!"})
        }
         next()
    }catch(error){
        console.log(error)
        return res.status(500).json({msg:error})
    }
}