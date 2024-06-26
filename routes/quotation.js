import { Router } from "express";
import { CheckUserIsValid } from "../middlewares/securityChecker.js";
import { getallQuote, getQuotation, getSingleQuotation } from "../controller/quotation.js";

export const quoteRouter = Router()

quoteRouter.get('/quotation',CheckUserIsValid,getallQuote)

quoteRouter.get('/qtTable',CheckUserIsValid,getQuotation)
quoteRouter.get('/quotation/:id',CheckUserIsValid,getSingleQuotation)