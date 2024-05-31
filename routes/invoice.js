import { Router } from "express";
import { CheckUserIsValid } from "../middlewares/securityChecker.js";
import { calculateTotal, getallInvoice, getInvoice, getSingleInvoice } from "../controller/invoice.js";

export const invoiceRoute = Router()
invoiceRoute.get('/invoice',CheckUserIsValid,getallInvoice);

invoiceRoute.get('/invoicetable',CheckUserIsValid,getInvoice);
invoiceRoute.get('/invoice/:id',CheckUserIsValid,getSingleInvoice);
invoiceRoute.get('/calculateInvoice',CheckUserIsValid,calculateTotal);