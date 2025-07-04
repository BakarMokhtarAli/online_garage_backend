// invoice.routes.ts
import express from "express";
import { getInvoiceJSON } from "../controllers/invoice.controller";
import { protect } from "../middleware/protect";

const router = express.Router();

router.get("/:paymentId", getInvoiceJSON);

export default router;
