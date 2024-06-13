import getPrismaInstant from "../lib/prisma.js";

const prisma = getPrismaInstant()


const daily = async (req,res) =>{
    const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const todayEnd = new Date(todayStart);
        todayEnd.setDate(todayEnd.getDate() + 1);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStart = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

    try{
        const todaye = await prisma.invoice.findMany({
            where:{
                mode:'invoice',
                invDate:{
                    gte: yesterdayStart.toISOString(),
                     lt: todayStart.toISOString()
                },
                deletedAt:null
            },
            select:{
                balance:true
            }
        })

        const yesterdaye = await prisma.invoice.findMany({
            where:{
                mode:'invoice',
                invDate:{
                    gte:new Date(todayStart.getFullYear() , todayStart.getMonth() , todayStart.getDate() - 2).toISOString() ,
                    lt:new Date(todayEnd.getFullYear() , todayEnd.getMonth() , todayEnd.getDate() - 2).toISOString()
                },
                deletedAt:null
            },
            select:{
                balance:true
            }
        })

        const caltoday = todaye.reduce((acc , curr) => acc + curr.balance , 0);
        const calyesterday = yesterdaye.reduce((acc , curr)=>acc + curr.balance , 0);

        

        return {caltoday , calyesterday};
    }catch(error){
        console.log(error)
        return res.status(500).json({msg:error})
    }
}

const calculatePercentageChange = (todayTotal, yesterdayTotal) => {
    const change = todayTotal - yesterdayTotal;
    const percentageChange = ((todayTotal - yesterdayTotal) / yesterdayTotal);

    const changeType = change > 0 ? "increase" : (change < 0 ? "decrease" : "no change");
    
    return { percentageChange, changeType };
};
export const dailyInvoice = async (req,res) =>{
    try {
        const { caltoday , calyesterday , grandTotal } = await daily();
        const { percentageChange, changeType } = calculatePercentageChange(caltoday , calyesterday);
        return res.status(200).json({ caltoday , calyesterday , percentageChange, changeType });
    } catch (error) {
        console.error('Error retrieving data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}



const dailyPaid = async (req,res) =>{
    const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const todayEnd = new Date(todayStart);
        todayEnd.setDate(todayEnd.getDate() + 1);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStart = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

    try{
        const todaye = await prisma.invoice.findMany({
            where:{
                mode:'invoice',
                invDate:{
                    gte: yesterdayStart.toISOString(),
                     lt: todayStart.toISOString()
                },
                invStatus: 'paid',
                deletedAt:null
            },
            select:{
                balance:true
            }
        })

        const yesterdaye = await prisma.invoice.findMany({
            where:{
                mode:'invoice',
                invDate:{
                    gte:new Date(todayStart.getFullYear() , todayStart.getMonth() , todayStart.getDate() - 2).toISOString() ,
                    lt:new Date(todayEnd.getFullYear() , todayEnd.getMonth() , todayEnd.getDate() - 2).toISOString()
                },
                invStatus: 'paid',
                deletedAt:null
            },
            select:{
                balance:true
            }
        })

        const caltoday = todaye.reduce((acc , curr) => acc + curr.balance , 0);
        const calyesterday = yesterdaye.reduce((acc , curr)=>acc + curr.balance , 0);

        

        return {caltoday , calyesterday};
    }catch(error){
        console.log(error)
        return res.status(500).json({msg:error})
    }
}

const calculatePercentageChangePaid = (todayTotal, yesterdayTotal) => {
    const change = todayTotal - yesterdayTotal;
    const percentageChange = ((todayTotal - yesterdayTotal) / yesterdayTotal);

    const changeType = change > 0 ? "increase" : (change < 0 ? "decrease" : "no change");
    
    return { percentageChange, changeType };
};
export const dailyInvoicePaid = async (req,res) =>{
    try {
        const { caltoday , calyesterday , grandTotal } = await dailyPaid();
        const { percentageChange, changeType } = calculatePercentageChangePaid(caltoday , calyesterday);
        return res.status(200).json({ caltoday , calyesterday , percentageChange, changeType });
    } catch (error) {
        console.error('Error retrieving data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}





const calculateMonthlyInvoiceSales = async () => {
    const today = new Date();
    const currentMonthFirstDay = new Date(today.getFullYear(), today.getMonth(), 1); // First day of the current month
    const currentMonthLastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Last day of the current month

    const lastMonthFirstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1); // First day of the last month
    const lastMonthLastDay = new Date(today.getFullYear(), today.getMonth(), 0); // Last day of the last month

    const thisMonthTotalInvoiceSales = await prisma.invoice.findMany({
        where: {
            mode: 'invoice',
            invDate: {
                gte: new Date(currentMonthFirstDay.getFullYear() , currentMonthFirstDay.getMonth() , currentMonthFirstDay.getDate() - 1).toISOString(),
                lt: new Date(currentMonthLastDay.getFullYear() , currentMonthLastDay.getMonth() , currentMonthLastDay.getDate() -1).toISOString()
            },
            deletedAt: null
        },
        select: {
            balance: true
        }
    });

    const lastMonthTotalInvoiceSales = await prisma.invoice.findMany({
        where: {
            mode: 'invoice',
            invDate: {
                gte: new Date(lastMonthFirstDay.getFullYear() , lastMonthFirstDay.getMonth() , lastMonthFirstDay.getDate() - 1).toISOString(),
                lt: new Date(lastMonthLastDay.getFullYear() , lastMonthLastDay.getMonth() , lastMonthLastDay.getDate() - 1).toISOString()
            },
            deletedAt: null
        },
        select: {
            balance: true
        }
    });

    const thisMonthTotal = thisMonthTotalInvoiceSales.reduce((acc, curr) => acc + curr.balance, 0);
    const lastMonthTotal = lastMonthTotalInvoiceSales.reduce((acc, curr) => acc + curr.balance, 0);

    const percentageChange = ((thisMonthTotal - lastMonthTotal) / lastMonthTotal);
    const changeType = percentageChange > 0 ? "increase" : (percentageChange < 0 ? "decrease" : "no change");

    return { thisMonth: thisMonthTotal, lastMonth: lastMonthTotal, percentageChange, changeType };
};




export const calculateMonthly = async(req,res) =>{
    try {
        const { thisMonth, lastMonth ,  percentageChange, changeType } = await calculateMonthlyInvoiceSales();
        res.json({ thisMonth, lastMonth ,  percentageChange, changeType });
    } catch (error) {
        console.error('Error retrieving data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const calculateMonthlyUnpaidInvoiceSales = async () => {
    const today = new Date();
    const currentMonthFirstDay = new Date(today.getFullYear(), today.getMonth(), 1); // First day of the current month
    const currentMonthLastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Last day of the current month

    const lastMonthFirstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1); // First day of the last month
    const lastMonthLastDay = new Date(today.getFullYear(), today.getMonth(), 0); // Last day of the last month

    const thisMonthTotalUnpaidInvoiceSales = await prisma.invoice.findMany({
        where: {
            mode:'invoice',
            invDate: {
                gte: new Date(currentMonthFirstDay.getFullYear() , currentMonthFirstDay.getMonth() , currentMonthFirstDay.getDate() - 1).toISOString(),
                lt: new Date(currentMonthLastDay.getFullYear() , currentMonthLastDay.getMonth() , currentMonthLastDay.getDate() -1).toISOString()
            },
            invStatus: 'unpay',
            deletedAt:null
        },
        select: {
            balance: true
        }
    });

    const lastMonthTotalUnpaidInvoiceSales = await prisma.invoice.findMany({
        where: {
            mode:'invoice',
            invDate: {
                gte: new Date(lastMonthFirstDay.getFullYear() , lastMonthFirstDay.getMonth() , lastMonthFirstDay.getDate() - 1).toISOString(),
                lt: new Date(lastMonthLastDay.getFullYear() , lastMonthLastDay.getMonth() , lastMonthLastDay.getDate() - 1).toISOString()
            },
            invStatus: 'unpay',
            deletedAt:null
        },
        select: {
            balance: true
        }
    });

    const thisMonthTotal = thisMonthTotalUnpaidInvoiceSales.reduce((acc, curr) => acc + curr.balance, 0);
    const lastMonthTotal = lastMonthTotalUnpaidInvoiceSales.reduce((acc, curr) => acc + curr.balance, 0);

    const percentageChange = ((thisMonthTotal - lastMonthTotal) / lastMonthTotal);
    const changeType = percentageChange > 0 ? "increase" : (percentageChange < 0 ? "decrease" : "no change");

    return { thisMonth: thisMonthTotal, lastMonth: lastMonthTotal , percentageChange, changeType };
};


export const getUnpaid = async (req,res) =>{
    try {
        const { thisMonth, lastMonth , percentageChange, changeType } = await calculateMonthlyUnpaidInvoiceSales();
        res.json({ thisMonth, lastMonth , percentageChange, changeType });
    } catch (error) {
        console.error('Error retrieving data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const calculateExpense = async () =>{
    const today = new Date();
    const currentMonthFirstDay = new Date(today.getFullYear(), today.getMonth(), 1); // First day of the current month
    const currentMonthLastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Last day of the current month

    const lastMonthFirstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1); // First day of the last month
    const lastMonthLastDay = new Date(today.getFullYear(), today.getMonth(), 0); // Last day of the last month

    const todaye = await prisma.purchase.findMany({
        where:{
            purSince:{
                gte: new Date(currentMonthFirstDay.getFullYear() , currentMonthFirstDay.getMonth() , currentMonthFirstDay.getDate() - 1).toISOString(),
                lt: new Date(currentMonthLastDay.getFullYear() , currentMonthLastDay.getMonth() , currentMonthLastDay.getDate() -1).toISOString()
            },
        },
        select:{
            purPrice:true
        }
    })

    const yesterdaye = await prisma.purchase.findMany({
        where:{
            purSince:{
                gte: new Date(lastMonthFirstDay.getFullYear() , lastMonthFirstDay.getMonth() , lastMonthFirstDay.getDate() - 1).toISOString(),
                lt: new Date(lastMonthLastDay.getFullYear() , lastMonthLastDay.getMonth() , lastMonthLastDay.getDate() - 1).toISOString()
            },
        },
        select:{
            purPrice:true
        }
    })

    const caltoday = todaye.reduce((acc , curr) => acc + curr.purPrice , 0);
    const calyesterday = yesterdaye.reduce((acc , curr)=>acc + curr.purPrice , 0);

    const percentageChange = ((caltoday - calyesterday) / calyesterday);
    const changeType = percentageChange > 0 ? "increase" : (percentageChange < 0 ? "decrease" : "no change");

    return { caltoday, calyesterday , percentageChange, changeType };
}


export const getExpenses = async (req,res) =>{
    try {
        const { caltoday , calyesterday , percentageChange , changeType } = await calculateExpense();
        res.json({ caltoday , calyesterday , percentageChange , changeType });
    } catch (error) {
        console.error('Error retrieving data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const calculateCustomer = async () =>{
    const today = new Date();
    const currentMonthFirstDay = new Date(today.getFullYear(), today.getMonth(), 1); // First day of the current month
    const currentMonthLastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Last day of the current month

    const lastMonthFirstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1); // First day of the last month
    const lastMonthLastDay = new Date(today.getFullYear(), today.getMonth(), 0); // Last day of the last month

    const thisMonthCustomerCount = await prisma.invoice.count({
        where: {
            mode: 'invoice',
            invDate: {
                gte: new Date(currentMonthFirstDay.getFullYear() , currentMonthFirstDay.getMonth() , currentMonthFirstDay.getDate() - 1).toISOString(),
                lt: new Date(currentMonthLastDay.getFullYear() , currentMonthLastDay.getMonth() , currentMonthLastDay.getDate() -1).toISOString()
            },
            deletedAt: null
        }
    });

    const lastMonthCustomerCount = await prisma.invoice.count({
        where: {
            mode: 'invoice',
            invDate: {
                gte: new Date(lastMonthFirstDay.getFullYear() , lastMonthFirstDay.getMonth() , lastMonthFirstDay.getDate() - 1).toISOString(),
                lt: new Date(lastMonthLastDay.getFullYear() , lastMonthLastDay.getMonth() , lastMonthLastDay.getDate() - 1).toISOString()
            },
            deletedAt: null
        }
    });

    const percentageChange = ((thisMonthCustomerCount - lastMonthCustomerCount) / lastMonthCustomerCount);
    const changeType = percentageChange > 0 ? "increase" : (percentageChange < 0 ? "decrease" : "no change");

    return { thisMonthCustomerCount, lastMonthCustomerCount , percentageChange, changeType };
}

export const getCustomer = async (req,res) =>{
        try {
            const { thisMonthCustomerCount , lastMonthCustomerCount , percentageChange, changeType } = await calculateCustomer();
            res.json({ thisMonth:thisMonthCustomerCount , lastMonth:lastMonthCustomerCount , percentageChange, changeType });
        } catch (error) {
            console.error('Error retrieving data:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
}

export const dailyCard = async (req, res) => {
    const { mode, filterDate } = req.query;
    try {
        // Getting today's date and yesterday's date
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const todayEnd = new Date(todayStart);
        todayEnd.setDate(todayEnd.getDate() + 1);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStart = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

        
        if (!filterDate) {
            return res.status(400).json({ error: 'Filter date is missing' });
        }

            // Get today's balance
            let todayPurchases = await prisma.invoice.findMany({
                where: {
                    mode:'invoice',
                    invStatus:{contains:mode},
                    invDate:{
                        gte: yesterdayStart.toISOString(),
                        lt: todayStart.toISOString()
                    },
                    deletedAt:null
                },
                select: {
                    balance: true
                }
            });
            let todayBalance = todayPurchases.reduce((acc, curr) => acc + curr.balance, 0);

            // Get yesterday's balance
            let yesterdayPurchases = await prisma.invoice.findMany({
                where: {
                    mode:'invoice',
                    invStatus:{contains:mode},
                    invDate:{
                        gte:new Date(todayStart.getFullYear() , todayStart.getMonth() , todayStart.getDate() - 2).toISOString() ,
                        lt:new Date(todayEnd.getFullYear() , todayEnd.getMonth() , todayEnd.getDate() - 2).toISOString()
                    },
                    deletedAt:null
                },
                select: {
                    balance: true
                }
            });
            let yesterdayBalance = yesterdayPurchases.reduce((acc, curr) => acc + curr.balance, 0);

            let status;

            // Compare today's balance with yesterday's balance
            if (filterDate === today.toISOString().slice(0, 10)) {
                if (todayBalance < yesterdayBalance) {
                    status = 'decrease';
                } else {
                    status = 'increase';
                }
                return res.status(200).json({ total: todayBalance.toFixed(2) , status });
            } else if (filterDate === yesterday.toISOString().slice(0, 10)) {
                if (yesterdayBalance < todayBalance) {
                    status = 'decrease';
                } else {
                    status = 'increase';
                }
                return res.status(200).json({ total: yesterdayBalance.toFixed(2) , status });
            }

    } catch (error) {
        console.error('Error retrieving data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const historyCard = async (req, res) => {
    const { page = 1, pageSize = 5 } = req.query;
    const offset = (page - 1) * pageSize;

    try {
        const invoice = await prisma.invoice.findMany({
            take: Number(pageSize),
            skip: Number(offset),
            where: {
                mode: 'invoice',
                deletedAt: null
            },
            orderBy: {
                invDate: 'desc' // Change orderBy to use invDate
            }
        });

        const totalCount = await prisma.invoice.count({
            where:{
                mode:'invoice',
                deletedAt:null
            }
        });
        
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const todayEnd = new Date(todayStart);
        todayEnd.setDate(todayEnd.getDate() + 1);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStart = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

        // Calculate today's balance
        const todayCount = await prisma.invoice.findMany({
            where:{
                mode: 'invoice',
                invDate:{
                    gte: yesterdayStart.toISOString(),
                    lt: todayStart.toISOString()
                },
                deletedAt: null
            },
            select:{
                balance: true
            }
        });
        const todayBalance = todayCount.reduce((acc, curr) => acc + curr.balance, 0);

        // Calculate yesterday's balance
        const yesterdayCount = await prisma.invoice.findMany({
            where:{
                mode: 'invoice',
                invDate:{
                    gte:new Date(todayStart.getFullYear() , todayStart.getMonth() , todayStart.getDate() - 2).toISOString() ,
                    lt:new Date(todayEnd.getFullYear() , todayEnd.getMonth() , todayEnd.getDate() - 2).toISOString()
                },
                deletedAt: null
            },
            select:{
                balance: true
            }
        });
        const yesterdayBalance = yesterdayCount.reduce((acc, curr) => acc + curr.balance, 0);


        const data = invoice.map(item => {
            let invDate = item.invDate; // Use invDate instead of createdAt
            
            if (invDate === today.toISOString().slice(0, 10)) {
                invDate = 'Today';
            } else if (invDate === yesterday.toISOString().slice(0, 10)) {
                invDate = 'Yesterday';
            }

            // Determine status based on balance changes
            const status = invDate === 'Today' ? (todayBalance < yesterdayBalance ? 'decreases' : 'increases') :
                           invDate === 'Yesterday' ? (yesterdayBalance < todayBalance ? 'decreases' : 'increases') :
                           'same';

            return { ...item , invDate , status };
        });

        const hasNextPage = offset + data.length < totalCount;
        const hasPrevPage = offset > 0;
        const nextPage = hasNextPage ? Number(page) + 1 : null;
        const prevPage = hasPrevPage ? Number(page) - 1 : null;

        res.json({ item: data, today: todayBalance , yesterday: yesterdayBalance , nextPage, prevPage });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Error fetching data' });
    }
}


export const historyTotal = async (req,res) =>{
    try{
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const todayEnd = new Date(todayStart);
        todayEnd.setDate(todayEnd.getDate() + 1);

        const invoice = await prisma.invoice.findMany({
            where:{
                mode:'invoice',
                invDate:{
                    gte:new Date(todayStart.getFullYear() , todayStart.getMonth() , todayStart.getDate() - 2).toISOString() ,
                    lt:new Date(todayEnd.getFullYear() , todayEnd.getMonth() , todayEnd.getDate() - 2).toISOString()
                },
                deletedAt:null
            },
            
            select:{
                balance:true
            }
        })
        const data = invoice.reduce((acc , curr)=>acc + curr.balance ,0)
        if(invoice){
            return res.status(200).json(data)
        }else{
            return res.status(404).json({msg:"sorry not found"})
        }
    }catch(error){
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Error fetching data' });
    }
}

export const recentlyActivity = async (req, res) => {
    const { page = '1', take = '6', filterDate = '' } = req.query;
    try {
        const takenValue = +take;
        const skip = (+page - 1) * takenValue;
        let filterOptions = {
            take: takenValue,
            skip,
            orderBy: {
                updatedAt: 'desc'
            }
        };

        // Add filter for today or yesterday
        if (filterDate === 'today') {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);
            filterOptions = {
                ...filterOptions,
                where: {
                    updatedAt: {
                        gte: todayStart,
                        lte: todayEnd
                    }
                }
            };
        } else if (filterDate === 'yesterday') {
            const yesterdayStart = new Date();
            yesterdayStart.setDate(yesterdayStart.getDate() - 1);
            yesterdayStart.setHours(0, 0, 0, 0);
            const yesterdayEnd = new Date();
            yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
            yesterdayEnd.setHours(23, 59, 59, 999);
            filterOptions = {
                ...filterOptions,
                where: {
                    updatedAt: {
                        gte: yesterdayStart,
                        lte: yesterdayEnd
                    }
                }
            };
        }

        const recently = await prisma.recently.findMany(filterOptions);
        const totalRecently = await prisma.recently.count();
        const totalPages = Math.ceil(totalRecently / takenValue);
        return res.status(200).json({
            recently,
            pagination: {
                page: +page,
                totalPages
            }
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Error fetching data' });
    }
};

export const chart = async (req, res) => {
    try {
        const data = await prisma.invoice.findMany({
            where: {
                mode:'invoice',
                deletedAt: null
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });

        if (data) {
            // Group balances by year and month
            const balancesByYearMonth = {};
            data.forEach(invoice => {
                const yearMonth = invoice.invDate.slice(0, 7); // Extracting year-month
                if (!balancesByYearMonth[yearMonth]) {
                    balancesByYearMonth[yearMonth] = 0;
                }
                balancesByYearMonth[yearMonth] += invoice.balance;
            });

            // Convert map into an array of objects [{ invDate, balance }]
            const result = Object.keys(balancesByYearMonth).map(yearMonth => ({
                createdAt: yearMonth,
                balance: balancesByYearMonth[yearMonth]
            }));

            return res.status(200).json(result);
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Error fetching data' });
    }
};

export const returnYears = async (req,res) =>{
    try{
        const result = await prisma.invoice.findMany({
            select:{
                createdAt:true
            },
            where:{
                deletedAt:null
            },
            orderBy:{
                createdAt:'desc'
            }
        })

        const years = result.map((item)=>{
            const year = new Date(item.createdAt).getFullYear()
            return year
        })

        return res.status(200).json(years)

    }catch(error){
        console.log(error);
        return res.status(500).json({ error: 'Error fetching data' });
    }
}

export const reportStuff = async (req, res) => {
    try {
        const { filterYear = '', startMonth = '', endMonth = '' } = req.query;

        // Initialize an array to hold the results
        let monthlyCounts = [];

        for (let month = parseInt(startMonth); month <= parseInt(endMonth); month++) {

            const monthName = new Date(`${filterYear}-${month}-01`).toLocaleString('en-us', { month: 'long' });

            const count = await prisma.invoice.count({
                where: {
                    AND: [
                        { invDate: { gte: `${filterYear}-${month.toString().padStart(2, '0')}-01` } }, // Start of month
                        { invDate: { lte: `${filterYear}-${month.toString().padStart(2, '0')}-31` } }    // End of month
                    ],
                    deletedAt:null
                }
            });

            const count1 = await prisma.quotation.count({
                where: {
                    AND: [
                        { qtDate: { gte: `${filterYear}-${month.toString().padStart(2, '0')}-01` } }, // Start of month
                        { qtDate: { lte: `${filterYear}-${month.toString().padStart(2, '0')}-31` } }    // End of month
                    ],
                    deletedAt:null
                }
            });
            const count2 = await prisma.invoice.count({
                where:{
                    AND:[
                        { invDate: { gte: `${filterYear}-${month.toString().padStart(2, '0')}-01` } }, // Start of month
                        { invDate: { lte: `${filterYear}-${month.toString().padStart(2, '0')}-31` } }    // End of month
                    ],
                    deletedAt:null
                }
            })
            const count3 = await prisma.invoice.findMany({
                where:{
                    AND:[
                        { invDate: { gte: `${filterYear}-${month.toString().padStart(2, '0')}-01` } }, // Start of month
                        { invDate: { lte: `${filterYear}-${month.toString().padStart(2, '0')}-31` } }    // End of month
                    ],
                    deletedAt:null
                },
                select:{
                    balance:true,
                    partial:true,
                    invStatus:true,
                    balance:true
                }
            })

            const sumSales = count3.reduce((acc , curr)=>acc + curr.balance,0)
            const sumPartial = count3.reduce((acc , curr)=>acc + curr.partial , 0)
            const filterCount5 = count3.filter((item)=>item.invStatus === 'unpay')
            const filter5Paid = count3.filter((item)=>item.invStatus === 'paid')
            const sumUnpaid = filterCount5.reduce((acc , curr)=>acc + curr.balance,0)
            const sumPaid = filter5Paid.reduce((acc , curr)=>acc + curr.balance,0)
            // Push the count for the current month to the result array

            const count6 = await prisma.purchase.findMany({
                where:{
                    AND:[
                        { purSince: { gte: `${filterYear}-${month.toString().padStart(2, '0')}-01` } }, // Start of month
                        { purSince: { lte: `${filterYear}-${month.toString().padStart(2, '0')}-31` } }    // End of month
                    ]
                },
                select:{
                    purPrice:true
                }
            })

            const sumExp = count6.reduce((acc , curr)=>acc + curr.purPrice,0)

            monthlyCounts.push({ month: monthName, arr:[{customer: count , quotation: count1 , invoice:count2,sales:sumSales,partial:sumPartial,unpaid:sumUnpaid, paid:sumPaid , expense:sumExp}] });
        }

        return res.status(200).json(monthlyCounts);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Error fetching data' });
    }
};


export const telegram = async (req,res) =>{
    try{
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const todayEnd = new Date(todayStart);
        todayEnd.setDate(todayEnd.getDate() + 1);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStart = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

        const todaye = await prisma.invoice.count({
            where:{
                mode:'invoice',
                invDate:{
                    gte: yesterdayStart.toISOString(),
                    lt: todayStart.toISOString()
                },
                deletedAt:null
            },
        })
        const todayExp = await prisma.purchase.findMany({
            where:{
                purSince:{
                    gte: yesterdayStart.toISOString(),
                    lt: todayStart.toISOString()
                },
            },
        })
        const todaySale = await prisma.invoice.findMany({
            where:{
                mode:'invoice',
                invDate:{
                    gte: yesterdayStart.toISOString(),
                    lt: todayStart.toISOString()
                },
                deletedAt:null
            },
        })
        const todayPaid = await prisma.invoice.findMany({
            where:{
                invStatus:'paid',
                mode:'invoice',
                invDate:{
                    gte: yesterdayStart.toISOString(),
                    lt: todayStart.toISOString()
                },
                deletedAt:null
            }
        })
        const calExp = todayExp.reduce((acc,curr)=>acc + curr.purPrice,0)
        const calSale = todaySale.reduce((acc,curr)=>acc + curr.balance,0)
        const calPaid = todayPaid.reduce((acc,curr)=>acc + curr.balance,0)
        return res.status(200).json({invoice:todaye , expense:calExp , sales:calSale , paid:calPaid})
    }catch(error){
        console.log(error);
        return res.status(500).json({ error: 'Error fetching data' });
    }
}
