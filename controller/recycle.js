import getPrismaInstant from "../lib/prisma.js"

const prisma = getPrismaInstant()

function isNumeric(str) {
    return /^\d+$/.test(str);
}


export const recycleStuff = async (req, res) => {
    try {
        const { page = 1, pageSize = 3, fromDate, toDate, filters , filterName } = req.query;
        const pageNumber = parseInt(page);
        const size = parseInt(pageSize);


        const [invoiceCount, invoices, quotationCount, quotations, receiptCount, receipts] = await Promise.all([
            prisma.invoice.count({ where: {
                AND:[
                    {
                        OR:[
                            {invNo:{contains:filters , mode: 'insensitive'}},
                        ]
                    },
                    filterName ? {
                        customer:{
                            cusName:{
                                contains:filters
                                , mode: 'insensitive'
                            }
                        }
                    } : {},
                    fromDate && toDate ? {
                        OR: [
                            { createdAt: { gte: new Date(fromDate), lte: new Date(toDate) } },
                            { updatedAt: { gte: new Date(fromDate), lte: new Date(toDate) } }
                        ]
                    } : {},
                ],
                deletedAt:{ not:null }
            } }),
            prisma.invoice.findMany({
                take: size,
                skip: (pageNumber - 1) * size,
                where: {
                    AND:[
                        {
                            OR:[
                                {invNo:{contains:filters , mode: 'insensitive'}}
                            ]
                        },
                        filterName ? {
                            customer:{
                                cusName:{
                                    contains:filters
                                    , mode: 'insensitive'
                                }
                            }
                        } : {},
                        fromDate && toDate ? {
                            OR: [
                                { createdAt: { gte: new Date(fromDate), lte: new Date(toDate) } },
                                { updatedAt: { gte: new Date(fromDate), lte: new Date(toDate) } }
                            ]
                        } : {},
                    ],
                    deletedAt: { not: null } 
                },include:{
                    customer:{
                        select:{
                            cusName:true
                        }
                    }
                },
                orderBy: { updatedAt: 'desc' }
            }),
            prisma.quotation.count({ where: {
                AND:[
                    {
                        OR:[
                            {qtNo:{contains:filters , mode: 'insensitive'}},
                            
                        ]
                    },
                    filterName ? {
                        customer:{
                            cusName:{
                                contains:filters
                                , mode: 'insensitive'
                            }
                        }
                    } : {},
                    fromDate && toDate ? {
                        OR: [
                            { createdAt: { gte: new Date(fromDate), lte: new Date(toDate) } },
                            { updatedAt: { gte: new Date(fromDate), lte: new Date(toDate) } }
                        ]
                    } : {},
                ],
                deletedAt:{ not:null }
            }}),
            prisma.quotation.findMany({
                take: size,
                skip: (pageNumber - 1) * size,
                where: {
                    AND:[
                        {
                            OR:[
                                {qtNo:{contains:filters , mode: 'insensitive'}},
                            ]
                        },
                        filterName ? {
                            customer:{
                                cusName:{
                                    contains:filters
                                    , mode: 'insensitive'
                                }
                            }
                        } : {},
                        fromDate && toDate ? {
                            OR: [
                                { createdAt: { gte: new Date(fromDate), lte: new Date(toDate) } },
                                { updatedAt: { gte: new Date(fromDate), lte: new Date(toDate) } }
                            ]
                        } : {},
                    ],
                    deletedAt: { not: null } 

                },
                include:{
                    customer:{
                        select:{
                            cusName:true
                        }
                    }
                },
                orderBy: { updatedAt: 'desc' }
            }),
            prisma.receipt.count({ where: {
                AND:[
                    {
                        OR:[
                            {recNo:{contains:filters , mode: 'insensitive'}},
                            
                        ]
                    },
                    filterName ? {recFrom:{contains:filters , mode: 'insensitive'}} : {},
                    fromDate && toDate ? {
                        OR: [
                            { createdAt: { gte: new Date(fromDate), lte: new Date(toDate) } },
                            { updatedAt: { gte: new Date(fromDate), lte: new Date(toDate) } }
                        ]
                    } : {},
                ],
                deletedAt:{ not:null }
            } }),
            prisma.receipt.findMany({
                take: size,
                skip: (pageNumber - 1) * size,
                where: {
                    AND:[
                        {
                            OR:[
                                {recNo:{contains:filters , mode: 'insensitive'}},
                            ]
                        },
                        filterName ? {recFrom:{contains:filters , mode: 'insensitive'}} : {},
                        fromDate && toDate ? {
                            OR: [
                                { createdAt: { gte: new Date(fromDate), lte: new Date(toDate) } },
                                { updatedAt: { gte: new Date(fromDate), lte: new Date(toDate) } }
                            ]
                        } : {},
                    ],
                    deletedAt: { not: null } 
                },
                orderBy: { updatedAt: 'desc' }
            })
        ]);

        const totalItemCount = invoiceCount + quotationCount + receiptCount;
        const totalPages = Math.ceil(totalItemCount / size);

        const recycling = [{invoice:invoices,quotation:quotations,receipt:receipts}]

        return res.status(200).json({
            recycling,
            pagination: {
                page: pageNumber,
                totalPages
            }
        });
    } catch (error) {
        console.error('Error fetching paginated data:', error);
        return res.status(500).json({ error: 'An error occurred while fetching data.' });
    }
};
