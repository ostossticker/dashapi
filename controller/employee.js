import Fuse from "fuse.js";
import getPrismaInstant from "../lib/prisma.js"

const prisma = getPrismaInstant()

export const getEmployee = async (req, res) => {
    try {
        const { filter = '', take = "5", page = '1', filter1 = '', gender = '', occ = '' } = req.query;

        let takenValue = +take;
        let skip = (+page - 1) * takenValue;

        const employ = await prisma.emp.findMany({
            take: takenValue,
            skip,
            where: {
                AND: [
                    {
                        OR: [
                            { empName: { contains: filter } },
                            { empGender: { contains: filter } },
                            { empOcc: { contains: filter } }
                        ]
                    },
                    filter1 ? { empName: { contains: filter1 } } : {},
                    gender ? { empGender: { contains: gender } } : {},
                    occ ? { empOcc: { contains: occ } } : {}
                ]
            },
            orderBy: {
                creatdAt: 'desc'
            }
        });

        // Implementing fuzzy search using fuse.js
        const fuse = new Fuse(employ, {
            keys: ['empName', 'empGender', 'empOcc'],
            threshold:0.2,
            includeScore: true
        });

        const fuzzyFilteredResults = filter ? fuse.search(filter).map(result => result.item) : employ;

        const totalEmployee = await prisma.emp.count();
        const totalPages = Math.ceil(totalEmployee / takenValue);

        return res.status(200).json({
            employ: fuzzyFilteredResults,
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