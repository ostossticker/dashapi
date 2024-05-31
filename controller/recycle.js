import getPrismaInstant from "../lib/prisma.js"

const prisma = getPrismaInstant()

export const recycleStuff = async (req, res) => {
    try {
        const { page = 1, pageSize = 3, fromDate, toDate, ...filters } = req.query;
        const pageNumber = parseInt(page);
        const size = parseInt(pageSize);

        const invoiceFilters = prepareFilters(filters, 'invoice', fromDate, toDate);
        const quotationFilters = prepareFilters(filters, 'quotation', fromDate, toDate);
        const receiptFilters = prepareFilters(filters, 'receipt', fromDate, toDate);

        const [invoiceCount, invoices, quotationCount, quotations, receiptCount, receipts] = await Promise.all([
            prisma.invoice.count({ where: {
                ...invoiceFilters,
                deletedAt:{ not:null }
            } }),
            prisma.invoice.findMany({
                take: size,
                skip: (pageNumber - 1) * size,
                where: {
                    ...invoiceFilters,
                    deletedAt: { not: null } 
                },
                orderBy: { updatedAt: 'desc' }
            }),
            prisma.quotation.count({ where: {
                ...quotationFilters,
                deletedAt:{ not:null }
            } }),
            prisma.quotation.findMany({
                take: size,
                skip: (pageNumber - 1) * size,
                where: {
                    ...quotationFilters,
                    deletedAt: { not: null } 

                },
                orderBy: { updatedAt: 'desc' }
            }),
            prisma.receipt.count({ where: {
                ...receiptFilters,
                deletedAt:{ not:null }
            } }),
            prisma.receipt.findMany({
                take: size,
                skip: (pageNumber - 1) * size,
                where: {
                    ...receiptFilters,
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

const prepareFilters = (filters, modelName, fromDate, toDate) => {
    const modelFilters = {};

    const filterMap = {
        invoice: ['cusName1', 'invNo'],
        quotation: ['cusName2', 'qtNo'],
        receipt: ['recFrom', 'recNo']
    };

    const fields = filterMap[modelName] || [];
    fields.forEach(field => {
        if (filters[field]) {
            modelFilters[field] = { contains: filters[field] };
        }
    });

    if (fromDate && toDate) {
        if (modelName === 'invoice' || modelName === 'quotation' || modelName === 'receipt') {
            modelFilters.OR = [
                { createdAt: { gte: new Date(fromDate), lte: new Date(toDate) } },
                { updatedAt: { gte: new Date(fromDate), lte: new Date(toDate) } }
            ];
            if (modelName !== 'invoice') {
                modelFilters.deletedAt = null;
            }
        }
    }

    return modelFilters;
};
