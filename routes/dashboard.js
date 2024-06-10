import { Router } from "express";
import { CheckUserIsValid } from "../middlewares/securityChecker.js";
import { calculateMonthly, chart, dailyCard, dailyInvoice, dailyInvoicePaid, getCustomer, getExpenses, getUnpaid, historyCard, historyTotal, recentlyActivity, reportStuff, returnYears, telegram } from "../controller/dahsboard.js";
import { searchRoute } from "../controller/search.js";

export const dashRoute = Router()

dashRoute.get('/daily',CheckUserIsValid,dailyInvoice)
dashRoute.get('/dailyPaid',CheckUserIsValid,dailyInvoicePaid)
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
dashRoute.get('/search',CheckUserIsValid,searchRoute)