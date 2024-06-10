import { Router } from "express";
import { CheckUserIsValid } from "../middlewares/securityChecker.js";
import { getAllEmp, getAllEmps, getEmployee, getSingleEmployee } from "../controller/employee.js";

export const employeeRoute = Router()

///dropdown
employeeRoute.get('/employees',CheckUserIsValid,getAllEmp);
employeeRoute.get('/employees1',CheckUserIsValid,getAllEmps);
employeeRoute.get('/employeetable',CheckUserIsValid,getEmployee);
employeeRoute.get('/employee/:id',CheckUserIsValid,getSingleEmployee);