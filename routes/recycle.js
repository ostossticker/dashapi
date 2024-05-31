import { Router } from "express";
import { CheckUserIsValid } from "../middlewares/securityChecker.js";
import { recycleStuff } from "../controller/recycle.js";

export const recycleRoute = Router()

recycleRoute.get('/recycle',CheckUserIsValid,recycleStuff)