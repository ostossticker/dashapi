import { Router } from "express";
import { CheckUserIsValid } from "../middlewares/securityChecker.js";
import { calculateMonthly, chart, dailyCard, dailyInvoice, getCustomer, getExpenses, getUnpaid, historyCard, historyTotal, recentlyActivity, reportStuff, returnYears, telegram } from "../controller/dahsboard.js";

export const dashRoute = Router()

dashRoute.get('/daily',CheckUserIsValid,dailyInvoice)
dashRoute.get('/totalsales',CheckUserIsValid,calculateMonthly)
dashRoute.get('/unpaid',CheckUserIsValid, getUnpaid)
dashRoute.get('/expenses',CheckUserIsValid,getExpenses)
dashRoute.get('/customer',CheckUserIsValid,getCustomer)
dashRoute.get('/dailyCard',CheckUserIsValid,dailyCard)
dashRoute.get('/history',CheckUserIsValid,historyCard)
dashRoute.get('/historyTotal',CheckUserIsValid,historyTotal)
dashRoute.get('/recently',CheckUserIsValid,recentlyActivity)
dashRoute.get('/chart',chart)
dashRoute.get('/years',CheckUserIsValid,returnYears)
dashRoute.get('/print',CheckUserIsValid,reportStuff)
dashRoute.get('/telegram',CheckUserIsValid,telegram)