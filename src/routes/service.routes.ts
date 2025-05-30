import express from "express";
import {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
} from "../controllers/service.controller";
import { protect, restrictTo } from "../middleware/protect";

const router = express.Router();

router.post("/", protect, restrictTo("admin"), createService);
router.get("/", protect, restrictTo("admin"), getAllServices);
router.get("/:id", protect, restrictTo("admin"), getServiceById);
router.put("/:id", protect, restrictTo("admin"), updateService);
router.delete("/:id", protect, restrictTo("admin"), deleteService);

export default router;
