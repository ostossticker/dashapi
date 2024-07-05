import { Router } from "express";
import { CheckUserIsValid } from "../middlewares/securityChecker.js";
import { getPayData, getallPayment, groupingCal, ungroupCal } from "../controller/payment.js";

export const paymentRoute = Router()

paymentRoute.get('/getPayment',CheckUserIsValid,getPayData)
paymentRoute.get('/getSearch',CheckUserIsValid,getallPayment)
paymentRoute.get('/grouping',CheckUserIsValid,groupingCal)
paymentRoute.get('/ungrouping',CheckUserIsValid,ungroupCal)