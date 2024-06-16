import Fuse from "fuse.js";
import getPrismaInstant from "../lib/prisma.js"

const prisma = getPrismaInstant()

export const getBusiness = async (req,res) =>{
    try {
        const { filter = '', take = '2', page = '1' ,name=''} = req.query;
        const takenValue = +take;
        const skip = (page - 1) * takenValue;
    
        const user = await prisma.user.findFirst({
          where: {
            name:name
          }
        });
    
        let businesses;
        let totalBusiness;
        if (user.role === "ADMIN") {
          businesses = await prisma.business.findMany({
            take: takenValue,
            skip,
            where: {
              OR: [
                { busName: { contains: filter, mode: 'insensitive' } },
                { busEmail: { contains: filter, mode: 'insensitive' } }
              ],
            },
            orderBy: {
              busName: 'asc'
            }
          });
          totalBusiness = await prisma.business.count({
            where: {
              OR: [
                { busName: { contains: filter, mode: 'insensitive' } },
                { busEmail: { contains: filter, mode: 'insensitive' } }
              ],
            }
          });
        } else {
          businesses = [];
          for (const busName of user.businessType) {
            const businessesByType = await prisma.business.findMany({
              take: takenValue,
              skip,
              where: {
                OR: [
                  { busName: { contains: filter, mode: 'insensitive' } },
                  { busEmail: { contains: filter, mode: 'insensitive' } }
                ],
                busName: busName,
              },
              orderBy: {
                busName: 'asc'
              }
            });
            businesses.push(...businessesByType);
          }
          totalBusiness = businesses.length; // Assuming businesses array contains all filtered businesses
        }
    
        const totalPages = Math.ceil(totalBusiness / takenValue);
    
        return res.status(200).json({
          buses: businesses,
          pagination: {
            page:+page,
            totalPages
          }
        });
      } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: error.message });
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
        const { filter , name } = req.query
        let buss;
        const user = await prisma.user.findFirst({
            where:{
                name:name
            }
        })

        if(user.role === 'ADMIN'){
            buss = await prisma.business.findMany({})
        }else{
            buss = []
            for(const busName of user.businessType){
                const businessByType = await prisma.business.findMany({
                    where:{
                        busName
                    },
                    orderBy: {
                      busName: 'asc'
                    }
                })
                buss.push(...businessByType)
            }
        }
       
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