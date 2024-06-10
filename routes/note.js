import { Router } from "express";
import { getNoteTable } from "../controller/note,js";
import { getEditNote } from "../controller/note,js";
import { CheckUserIsValid } from "../middlewares/securityChecker.js";

export const noteRoute = Router()
noteRoute.get("/note",CheckUserIsValid,getNoteTable)
noteRoute.get("/note/:id",CheckUserIsValid,getEditNote)
