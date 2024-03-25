import { Router } from "express";
import { CheckUserIsValid } from "../middlewares/securityChecker.js";
import { getPurchase, getSinglePurchase, getallpurs } from "../controller/purchase.js";

export const purchaseRoute = Router();

///get all purchase
purchaseRoute.get('/purchases',CheckUserIsValid,getallpurs)

purchaseRoute.get('/purchasetable',CheckUserIsValid,getPurchase);
purchaseRoute.get('/purchase/:id',CheckUserIsValid,getSinglePurchase);