import { Router } from "express";
import { CheckUserIsValid } from "../middlewares/securityChecker.js";
import { getAllBusiness, getBusiness, getSingleBusiness } from "../controller/business.js";

export const businessRoute = Router()

///drop down datas
businessRoute.get('/businesss',CheckUserIsValid,getAllBusiness);

businessRoute.get('/businesstable',CheckUserIsValid,getBusiness)
businessRoute.get('/business/:id',CheckUserIsValid,getSingleBusiness)







