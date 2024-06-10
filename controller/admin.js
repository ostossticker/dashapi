import getPrismaInstant from "../lib/prisma.js"
import filterLowerCasePreserveCase from "../lib/functions.js";

const prisma = getPrismaInstant()

export const getAdmin = async (req,res) =>{
    try{
        const {filter='' , take='15' , page='1'} = req.query
        
        const tranformedFilter = filterLowerCasePreserveCase(filter)

        const takeVlaue = +take
        const skip = (+page - 1) * takeVlaue

        const admin = await prisma.user.findMany({
            take:takeVlaue,
            skip,
            where:{
                AND:[
                    {
                        OR:[
                            {name:{contains:tranformedFilter}},
                            {email:{contains:tranformedFilter}}
                        ]
                    }
                ],
            },
            orderBy:{
                emailVerified:'desc'
            }
        })

        let totalData = await prisma.user.count()
        let totalPages = Math.ceil(totalData / takeVlaue)
        return res.status(200).json({
            admin,
            pagination:{
                page:+page,
                totalPages
            }
        }) 
    }catch(error){
        console.log(error)
        return res.status(500).json({msg:error})
    }
}

export const showEditAdmin = async(req,res) =>{
    try{
        const id = req.params.id
        if(!id){
            return res.status(404).json({msg:"sorry not founded!"})
        }
        const singleAdmin = await prisma.user.findUnique({
            where:{
                id
            }
        })
        if(!singleAdmin){
            return res.status(404).json({error:"edit admin not founded!"})
        }else{
            return res.status(200).json(singleAdmin)
        }
    }catch(error){
        console.log(error)
        return res.status(500).json({msg:error})
    }
}