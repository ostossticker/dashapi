import { Router } from "express";
import { CheckUserIsValid } from "../middlewares/securityChecker.js";
import { getAllCustomer, getCustomer, getSingleCustomer } from "../controller/customer.js";

export const customerRoute = Router()

//drop down
customerRoute.get("/customerss",CheckUserIsValid,getAllCustomer)

customerRoute.get('/customertable',CheckUserIsValid,getCustomer);
customerRoute.get("/customer/:id",CheckUserIsValid,getSingleCustomer);