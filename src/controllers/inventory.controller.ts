import { NextFunction, Response } from "express";
import Inventory from "../models/inventory.model";
import { AuthRequest } from "../middleware/protect";
import AppError from "../utils/AppError";
import Assign from "../models/assign.model";

export const createInventoryItem = async (req: AuthRequest, res: Response) => {
  const item = await Inventory.create(req.body);
  res.status(201).json({
    status: "success",
    message: "Inventory item created successfully!",
    item,
  });
};

export const getAllInventory = async (_req: AuthRequest, res: Response) => {
  const items = await Inventory.find().sort({ createdAt: -1 });
  res.status(200).json({
    status: "success",
    result: items.length,
    items,
  });
};

export const getInventoryById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const item = await Inventory.findById(req.params.id);
  if (!item) return next(new AppError("Item not found", 404));
  // Count how many times this item has been used in assigns
  const inventoryUsage = await Assign.find({
    "usedInventory.item": item._id,
  }).populate([
    {
      path: "transferHistory.from",
      select: "name user_id",
    },
    {
      path: "transferHistory.to",
      select: "name user_id",
    },
  ]);
  res.status(200).json({
    status: "success",
    totalUsage: inventoryUsage.length,
    item,
    inventoryUsage,
  });
};

export const updateInventoryItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const updated = await Inventory.findByIdAndUpdate(id, req.body, {
    new: true,
  });
  if (!updated) return next(new AppError("Item not found", 404));
  res.status(200).json(updated);
};

export const deleteInventoryItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const deleted = await Inventory.findByIdAndDelete(id);
  if (!deleted) return next(new AppError("Item not found", 404));
  res.status(200).json({ message: "Item deleted successfully" });
};
