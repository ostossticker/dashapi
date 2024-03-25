import { Router } from "express";
import { CheckUserIsValid } from "../middlewares/securityChecker.js";
import { getAllProducts, getProduct, getSingleProduct } from "../controller/product.js";

export const productRoute = Router()

///drop down list
productRoute.get('/products',CheckUserIsValid,getAllProducts);

productRoute.get('/producttable',CheckUserIsValid,getProduct);
productRoute.get('/product/:id',CheckUserIsValid,getSingleProduct);