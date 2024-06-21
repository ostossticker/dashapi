import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { customerRoute } from './routes/customer.js';
import { employeeRoute } from './routes/employee.js';
import { productRoute } from './routes/product.js';
import { purchaseRoute } from './routes/purchase.js';
import { userRoute } from './routes/users.js';
import { businessRoute } from './routes/business.js';
import { invoiceRoute } from './routes/invoice.js';
import getPrismaInstant, { measureTime } from './lib/prisma.js';
import { quoteRouter } from './routes/quotation.js';
import { receiptRoute } from './routes/receipt.js';
import { paymentRoute } from './routes/payment.js';
import { recycleRoute } from './routes/recycle.js';
import { notiRoute } from './routes/notification.js';
import { adminRoute } from './routes/admin.js';
import { dashRoute } from './routes/dashboard.js';
import filterLowerCasePreserveCase from './lib/functions.js';
import { noteRoute } from './routes/note.js';
import { payPaid } from './controller/payment.js';

dotenv.config();

const app = express()
app.use(cors({
    origin:"*"
}))

app.use(express.json())

const port = process.env.PORT

const prisma = getPrismaInstant()

app.use(measureTime)
app.use('/api',customerRoute);
app.use('/api',employeeRoute);
app.use('/api',productRoute);
app.use('/api',purchaseRoute);
app.use('/api',userRoute);
app.use('/api',invoiceRoute)
app.use('/api',businessRoute);
app.use('/api',quoteRouter);
app.use('/api',receiptRoute)
app.use('/api',paymentRoute);
app.use('/api',recycleRoute);
app.use('/api',notiRoute)
app.use('/api',adminRoute)
app.use('/api',dashRoute)
app.use('/api',noteRoute)


app.get('/test',async(req,res)=>{
    try{
        const invoice = await prisma.invoice.findMany({})
        return res.status(200).json({invoices:invoice.length})
    }catch(error){
        console.log(error)
    }
})

app.get('/payment',async(req,res)=>{
    try {
        const invoices = await prisma.invoice.findMany({
          include: {
            customer: true,
          },
          orderBy: {
            invDate: 'asc', // Optional: Order by invoice date if needed
          },
        });
    
        // Create a map to group invoices by cusName and invBus
        const groupedInvoices = invoices.reduce((acc, invoice) => {
          const key = `${invoice.customer.cusName}_${invoice.invBus}`;
          if (!acc[key]) {
            acc[key] = {
              cusName: invoice.customer.cusName,
              cusComp: invoice.customer.cusComp || '', // Assuming cusComp is optional
              invBus: invoice.invBus,
              count: 0,
              total: 0,
              phoneNumber: invoice.customer.cusPhone1 || '', // Assuming cusPhone1 is the phone number
            };
          }
    
          // Accumulate count and total
          acc[key].count++;
          acc[key].total += invoice.total || 0;
    
          return acc;
        }, {});
    
        // Convert object map to array and format the result as needed
        const formattedResult = Object.values(groupedInvoices).map((item) => ({
          cusName: item.cusName,
          cusComp: item.cusComp,
          invBus: item.invBus,
          count: item.count,
          phoneNumber: item.phoneNumber,
          total: item.total,
        }));
    
        // Log or return the formatted result
        console.log(formattedResult);
        return res.status(200).json(formattedResult);
    
      } catch (error) {
        console.error('Error fetching invoices:', error);
        throw error;
      } finally {
        await prisma.$disconnect();
      }
})

app.get('/payments',async(req,res)=>{
    try {
        const invoices = await prisma.invoice.findMany({
          include: {
            customer: true,
          },
          orderBy: {
            invDate: 'asc', // Optional: Order by invoice date if needed
          },
        });
    
        // Create a map to group invoices by cusName and invBus
        const groupedInvoices = invoices.reduce((acc, invoice) => {
          const key = `${invoice.customer.cusName}_${invoice.invBus}`;
          if (!acc[key]) {
            acc[key] = {
              cusName: invoice.customer.cusName,
              invBus: invoice.invBus,
              count: 0,
              totalPaid: 0,
              invoices: [],
            };
          }
    
          // Accumulate count and totalPaid
          acc[key].count++;
          if (invoice.invStatus === 'Paid') {
            acc[key].totalPaid += invoice.total || 0;
          }
    
          // Add invoice details to the invoices array
          acc[key].invoices.push({
            id: invoice.id,
            invNo: invoice.invNo,
            invStatus: invoice.invStatus,
            total: invoice.total,
            invDate: invoice.invDate,
            updatedAt: invoice.updatedAt,
            // Add more fields as needed
          });
    
          return acc;
        }, {});
    
        // Convert object map to array if needed
        const groupedInvoiceArray = Object.values(groupedInvoices);
    
        // Log or return the grouped invoices
        return res.status(200).json(groupedInvoiceArray);
    
      } catch (error) {
        console.error('Error fetching invoices:', error);
      } finally {
        await prisma.$disconnect();
      }
})
  
app.listen(port , ()=>{
    console.log(`server running on port ${port}`)
})