import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { measureTime } from '../lib/prisma.js';
import { customerRoute } from '../routes/customer.js';
import { employeeRoute } from '../routes/employee.js';
import { productRoute } from '../routes/product.js';
import { purchaseRoute } from '../routes/purchase.js';
import { userRoute } from '../routes/users.js';
import { businessRoute } from '../routes/business.js';
dotenv.config();

const app = express()
app.use(cors({
    origin:"*"
}))

app.use(express.json())

const port = process.env.PORT

app.use(measureTime)
app.use('/api',customerRoute);
app.use('/api',employeeRoute);
app.use('/api',productRoute);
app.use('/api',purchaseRoute);
app.use('/api',userRoute);
app.use('/api',businessRoute);

app.listen(port , ()=>{
    console.log(`server running on port ${port}`)
})