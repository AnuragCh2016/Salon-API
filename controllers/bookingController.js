import { Business } from "../models/Business.js";
import { Booking } from "../models/Booking.js";

export class BookingController {
  //function to book the service
  static bookService = async (req, res) => {
    try {
      // Find the business
      const business = await Business.findById(req.params.businessId);
      if (!business) {
        return res.status(404).json({
          error: "Business not found",
        });
      }

      // Check if the requested service is available at the business
      const service = business.services.find(
        (service) => service.name === req.body.service
      );
      if (!service) {
        return res.status(400).json({
          error: "Service not available at this business",
        });
      }

      // Check if the requested time slot is available
      const timeSlots = [];
      //req.body contains the date and time
      const date = req.body.date; //in mm-dd-yyyy format
      let dt = new Date(date);
      let day = dt.getDay();
      day = getDayName(day);
      // console.log(day);
      //   console.log(business.workSchedule);
      const findDay = business.workSchedule.find((el) => el.day === day);
      //   console.log(findDay);
      for (
        let i = make24Hour(findDay.startTime);
        compareTime(i, findDay.endTime) === true;
        i = addMinutes(i, 15)
      ) {
        if (i.endsWith("PM" || i.endsWith("AM"))) {
          timeSlots.push(i);
        } else {
          let toPush = make12Hour(i);
          timeSlots.push(toPush);
        }
      }
      if (!timeSlots.includes(req.body.time)) {
        return res.status(400).json({
          error: "Time slot not available",
        });
      }

      // Find the current bookings for the requested time slot
      const currentBookings = await Booking.find({
        business: req.params.businessId,
        time: req.body.time,
      });
      if (currentBookings.length >= business.chairs) {
        return res.status(400).json({
          error: "No chairs available at this time",
        });
      }

      // Create a new booking
      const booking = new Booking({
        business: req.params.businessId,
        service: req.body.service,
        timing: {
          date: req.body.date,
          time: req.body.time,
        },
        customer: req.body.customer,
        phone: req.body.phone,
      });
      const savedBooking = await booking.save();
      res.json(savedBooking);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }

    // Helper function to add minutes to a time string in the format 'HH:MM'
    function addMinutes(time, minutes) {
      if (time.endsWith("AM" || time.endsWith("PM"))) {
        time = make24Hour(time);
      }
      let [hours, mins] = time.split(":").map((el) => +el);
      mins += minutes;
      hours += Math.floor(mins / 60);

      mins %= 60;
      return `${hours}:${mins.toString().padStart(2, "0")}`;
    }

    //helper function to make 24hr string of time
    function make24Hour(time) {
      const suffix = time.split(" ")[1];
      if (suffix === "PM") {
        let withoutPrefix = time.substring(0, time.length - 2);
        let [hours, mins] = withoutPrefix.split(":");
        hours = Number(hours);
        if (hours != 12) hours += 12;
        let convertedTime = "" + hours + ":" + mins;
        return convertedTime;
      } else {
        return time.substring(0, time.length - 2);
      }
    }

    //helper function to compare time
    //input format: currentTime and endTime in 12hr format
    function compareTime(currentTime, endTime) {
      let t1 = currentTime,
        t2 = "";
      if (currentTime.endsWith("AM") || currentTime.endsWith("PM")) {
        t1 = make24Hour(currentTime);
      }
      t2 = make24Hour(endTime);
      let d1 = new Date("2020-01-01 " + t1);
      let d2 = new Date("2020-01-01 " + t2);
      return d1.getTime() < d2.getTime();
    }

    //helper function to make 12hr format from a 'HH:MM'
    function make12Hour(time) {
      let suffix = "AM";
      let [hours, mins] = time.split(":").map(Number);
      if (hours >= 12) {
        suffix = "PM";
        if (hours > 12) hours -= 12;
      }
      mins = String(mins);
      mins = mins.padStart(2, "0");
      return "" + hours + ":" + mins + " " + suffix;
    }

    //helper function to get day from date
    function getDayName(num) {
      const numToDay = {
        0: "Sunday",
        1: "Monday",
        2: "Tuesday",
        3: "Wednesday",
        4: "Thursday",
        5: "Friday",
        6: "Saturday",
      };

      return numToDay[num];
    }
  };
  //function to cancel a booking
  static cancelBooking = async (req, res) => {
    try {
      const bookingId = req.params.bookingId;
      // Find the booking
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(400).json({
          error: "Booking not found",
        });
      }

      // Check if the booking is at least 24 hours away
      const bookingTime = new Date(
        booking.timing.date + " " + booking.timing.time
      );
      const currentTime = new Date();
      const hoursDifference =
        (bookingTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60);
      if (hoursDifference < 24) {
        return res.status(400).json({
          error: "Cannot cancel booking within 24 hours of start time",
        });
      }

      // Cancel the booking
      booking.cancelled = true;
      const updatedBooking = await booking.save();
      res.json({ message: "Booking cancelled successfully" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
}
