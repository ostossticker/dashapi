import { Router } from "express";
import { CheckUserIsValid } from "../middlewares/securityChecker.js";
import { getPayData, getallPayment } from "../controller/payment.js";

export const paymentRoute = Router()

paymentRoute.get('/getPayment',CheckUserIsValid,getPayData)
paymentRoute.get('/getSearch',CheckUserIsValid,getallPayment)