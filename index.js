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
  
app.listen(port , ()=>{
    console.log(`server running on port ${port}`)
})