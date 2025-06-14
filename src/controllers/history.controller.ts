// service-history.controller.ts
import { Request, Response, NextFunction } from "express";
import Booking from "../models/booking.model";
import Assign from "../models/assign.model";
import Vehicle from "../models/vehicle.model";
import catchAsync from "../utils/catchAsync";

// Helper to apply optional filters
// const applyFilters = (
//   bookings: any[],
//   assigns: any[],
//   status?: string,
//   startDate?: string,
//   endDate?: string
// ) => {
//   return bookings
//     .filter((booking) => {
//       const assign = assigns.find(
//         (a) => a.booking_id.toString() === booking._id.toString()
//       );
//       const bookings = assigns.map(a => ({
//         ...a.booking_id,
//         assignedStatus: a.status,
//         mechanic: a.user_id,
//       }));

//       console.log("assign", assign?.status);

//       const matchesStatus = status ? assign?.status === status : true;
//       console.log("matchesStatus", matchesStatus);
//       const matchesDate =
//         startDate && endDate
//           ? new Date(booking.date) >= new Date(startDate) &&
//             new Date(booking.date) <= new Date(endDate)
//           : true;
//       return matchesStatus && matchesDate;
//     })
//     .map((booking) => {
//       const assign = assigns.find(
//         (a) => a.booking_id.toString() === booking._id.toString()
//       );
//       return {
//         booking_id: booking.booking_id,
//         vehicle: booking.vehicle_id,
//         service: booking.service_id,
//         date: booking.booking_date,
//         status: assign?.status || "unassigned",
//         mechanic: assign?.user_id || null,
//       };
//     });
// };

const applyFilters = (
  bookings: any[],
  _assigns: any[],
  status?: string,
  startDate?: string,
  endDate?: string
) => {
  return bookings
    .filter((booking) => {
      const matchesStatus = status ? booking.status === status : true;
      const matchesDate =
        startDate && endDate
          ? new Date(booking.booking_date) >= new Date(startDate) &&
            new Date(booking.booking_date) <= new Date(endDate)
          : true;
      return matchesStatus && matchesDate;
    })
    .map((booking) => {
      // console.log("booking", booking);

      return {
        booking_id: booking.booking_id,
        vehicle: booking.vehicle_id,
        service: booking.service_id,
        date: booking.booking_date,
        status: booking.status || "unassigned",
        mechanic: booking.user_id || null,
      };
    });
};

export const getServiceHistoryByCustomer = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const { status, startDate, endDate } = req.query;

    const bookings = await Booking.find({ user_id: userId })

      .populate({
        path: "service_id",
        select: "service_name service_id price",
      })
      .populate({
        path: "user_id",
        select: "name email phone user_id",
      })
      .lean();

    const assigns = await Assign.find({
      booking_id: { $in: bookings.map((b) => b._id) },
    })
      .populate("user_id", "fullName email user_id")
      .lean();

    const history = applyFilters(
      bookings,
      assigns,
      status as string,
      startDate as string,
      endDate as string
    );
    res.status(200).json({
      status: "success",
      result: history.length,
      history,
    });
  }
);

// Get service history by mechanic
export const getServiceHistoryByMechanic = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;
  const { status, startDate, endDate } = req.query;

  try {
    const assigns = await Assign.find({ user_id: userId })
      .populate({
        path: "booking_id",
        populate: [
          { path: "service_id", select: "service_name service_id price" },
        ],
      })
      .populate({
        path: "user_id",
        select: "name email phone user_id",
      })
      .lean();
    // console.log("assigns", assigns);

    const bookings = assigns.map((a) => a.booking_id);
    // console.log("bookings", bookings);

    const history = applyFilters(
      bookings,
      assigns,
      status as string,
      startDate as string,
      endDate as string
    );

    res.status(200).json({
      status: "success",
      result: history.length,
      history,
    });
  } catch (error) {
    next(error);
  }
};

export const getServiceHistoryByService = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { serviceId } = req.params;
    const { status, startDate, endDate } = req.query;

    const bookings = await Booking.find({ service_id: serviceId })

      .populate("service_id")
      .populate("user_id")
      .lean();

    const assigns = await Assign.find({
      booking_id: { $in: bookings.map((b) => b._id) },
    })
      .populate("user_id", "fullName email")
      .lean();

    const history = applyFilters(
      bookings,
      assigns,
      status as string,
      startDate as string,
      endDate as string
    );
    res.status(200).json({
      status: "success",
      result: history.length,
      history,
    });
  }
);
