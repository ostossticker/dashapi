import { Router } from "express";
import { CheckUserIsValid } from "../middlewares/securityChecker.js";
import { getNotification } from "../controller/notification.js";

export const notiRoute = Router()
notiRoute.get('/notificaiton',CheckUserIsValid,getNotification)