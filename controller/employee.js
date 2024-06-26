import Fuse from "fuse.js";
import getPrismaInstant from "../lib/prisma.js"

const prisma = getPrismaInstant()

export const getEmployee = async (req, res) => {
    try {
        const { filter = '', take = "15", page = '1', filter1 = '', gender = '', occ = '' } = req.query;

        let takenValue = +take;
        let skip = (+page - 1) * takenValue;

        const employ = await prisma.emp.findMany({
            take: takenValue,
            skip,
            where: {
                AND: [
                    {
                        OR: [
                            { empName: { contains: filter , mode: 'insensitive'} },
                            { empPhone: { contains: filter , mode: 'insensitive'} }
                        ]
                    },
                    filter1 ? { empName: { contains: filter1 , mode: 'insensitive'} } : {},
                    gender ? { empGender: { contains: gender , mode: 'insensitive'} } : {},
                    occ ? { empOcc: {contains:occ , mode: 'insensitive'} } : {}
                ]
            },
            orderBy: {
                empName: 'asc'
            }
        });

        // Implementing fuzzy search using fuse.js


        const totalEmployee = await prisma.emp.count();
        const totalPages = Math.ceil(totalEmployee / takenValue);

        return res.status(200).json({
            employ,
            pagination: {
                page: +page,
                totalPages
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ msg: error });
    }
};

export const getSingleEmployee = async (req,res) =>{
    try{
        const empId = req.params.id
        if(!empId){
            return res.status(404).json({error:"not founded!"})
        }
        const singleEmployee = await prisma.emp.findUnique({
            where:{
                id:empId
            }
        })
        if(!singleEmployee){
            return res.status(404).json({error:"single custoemr not founded!"})
        }
        return res.status(200).json({editEmp:singleEmployee})
    }catch(error){
        return res.status(500).json({msg:error})
    }
}

export const getAllEmp = async(req,res) =>{
    try{
        const { filter, phone, occupationFilter } = req.query;

        const emps = await prisma.emp.findMany({});

        const fuse = new Fuse(emps, {
            keys: ['empName', 'empOcc', 'empPhone'],
            threshold: 0.3,
            includeScore: true
        });

        let fuzzyFilteredResults = emps;

        // Apply filters
        if (filter) {
            fuzzyFilteredResults = fuse.search(filter).map(result => result.item);
        }

        if (occupationFilter) {
            fuzzyFilteredResults = fuzzyFilteredResults.filter(emp => emp.empOcc.includes(occupationFilter));
        }

        if(phone){
            fuzzyFilteredResults = fuzzyFilteredResults.filter(emp => emp.empPhone.includes(phone))
        }

        return res.status(200).json(fuzzyFilteredResults);
    }catch(error){
        return res.status(500).json({msg:error})
    }
}


export const getAllEmps = async(req,res) =>{
    try{
        const { filter, phone, occupationFilter } = req.query;

        const emps = await prisma.emp.groupBy({
            by:['empOcc']
        });

        const fuse = new Fuse(emps, {
            keys: ['empOcc'],
            threshold: 0.3,
            includeScore: true
        });

        let fuzzyFilteredResults = emps;

        // Apply filters
        if (filter) {
            fuzzyFilteredResults = fuse.search(filter).map(result => result.item);
        }

        if (occupationFilter) {
            fuzzyFilteredResults = fuzzyFilteredResults.filter(emp => emp.empOcc.includes(occupationFilter));
        }

        if(phone){
            fuzzyFilteredResults = fuzzyFilteredResults.filter(emp => emp.empPhone.includes(phone))
        }

        return res.status(200).json(fuzzyFilteredResults);
    }catch(error){
        return res.status(500).json({msg:error})
    }
}