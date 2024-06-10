import { Router } from "express";
import { CheckUserIsValid } from "../middlewares/securityChecker.js";
import {getAllRec, getReceipt, getSingleRec } from "../controller/receipt.js";

export const receiptRoute = Router()

receiptRoute.get('/receipts',CheckUserIsValid,getAllRec)

receiptRoute.get('/recTable',CheckUserIsValid,getReceipt)
receiptRoute.get('/receipt/:id',CheckUserIsValid,getSingleRec)
