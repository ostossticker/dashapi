import { Router } from "express";
import { CheckUserIsValid } from "../middlewares/securityChecker.js";
import { getAdmin, showEditAdmin } from "../controller/admin.js";

export const adminRoute = Router()

adminRoute.get('/admins',CheckUserIsValid , getAdmin)
adminRoute.get('/admins/:id',CheckUserIsValid,showEditAdmin)