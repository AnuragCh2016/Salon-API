import { Business } from "../models/Business.js";
import { Booking } from "../models/Booking.js";
export class BusinessController {
  //function to insert dummy data
  static insertBusinesses = async (req, res) => {
    try {
      const businesses = [
        {
          companyName: "Beauty Spa",
          gstin: "123456",
          panNumber: "ABCDEFG",
          address: "123 Main St, Kolkata",
          workSchedule: [
            { day: "Monday", startTime: "9:00 AM", endTime: "6:00 PM" },
            { day: "Tuesday", startTime: "9:00 AM", endTime: "6:00 PM" },
            { day: "Wednesday", startTime: "9:00 AM", endTime: "6:00 PM" },
            { day: "Thursday", startTime: "9:00 AM", endTime: "6:00 PM" },
            { day: "Friday", startTime: "9:00 AM", endTime: "6:00 PM" },
            { day: "Saturday", startTime: "9:00 AM", endTime: "6:00 PM" },
            { day: "Sunday", startTime: "10:00 AM", endTime: "4:00 PM" },
          ],
          services: [
            { name: "Haircut", duration: 30, cost: 50 },
            { name: "Blowout", duration: 45, cost: 35 },
            { name: "Manicure", duration: 45, cost: 25 },
            { name: "Pedicure", duration: 60, cost: 45 },
          ],
          chairs: 5,
        },
        {
          companyName: "Luxe Salon",
          gstin: "234567",
          panNumber: "HIJKLMN",
          address: "456 Main St, Delhi",
          workSchedule: [
            { day: "Monday", startTime: "9:00 AM", endTime: "8:00 PM" },
            { day: "Tuesday", startTime: "9:00 AM", endTime: "8:00 PM" },
            { day: "Wednesday", startTime: "9:00 AM", endTime: "8:00 PM" },
            { day: "Thursday", startTime: "9:00 AM", endTime: "8:00 PM" },
            { day: "Friday", startTime: "9:00 AM", endTime: "8:00 PM" },
            { day: "Saturday", startTime: "9:00 AM", endTime: "6:00 PM" },
            { day: "Sunday", startTime: "10:00 AM", endTime: "4:00 PM" },
          ],
          services: [
            { name: "Haircut", duration: 30, cost: 75 },
            { name: "Blowout", duration: 45, cost: 50 },
            { name: "Manicure", duration: 45, cost: 35 },
            { name: "Pedicure", duration: 60, cost: 50 },
          ],
          chairs: 10,
        },
        {
          companyName: "Spa Max pro",
          gstin: "457357",
          panNumber: "RTUHJDV",
          address: "234 Main St, Kolkata",
          workSchedule: [
            { day: "Monday", startTime: "9:00 AM", endTime: "6:00 PM" },
            { day: "Tuesday", startTime: "9:00 AM", endTime: "6:00 PM" },
            { day: "Thursday", startTime: "9:00 AM", endTime: "6:00 PM" },
            { day: "Saturday", startTime: "9:00 AM", endTime: "6:00 PM" },
            { day: "Sunday", startTime: "10:00 AM", endTime: "4:00 PM" },
          ],
          services: [
            { name: "Haircut", duration: 30, cost: 60 },
            { name: "Blowout", duration: 45, cost: 40 },
            { name: "Manicure", duration: 45, cost: 25 },
            { name: "Pedicure", duration: 60, cost: 50 },
          ],
          chairs: 7,
        },
      ];
      await Business.insertMany(businesses);
      console.log(businesses.length, "businesses inserted in DB");
      res
        .status(201)
        .json({ msg: `${businesses.length} businesses inserted in DB` });
    } catch (error) {
      res.status(500).json(error);
    }
  };

  //controller function for paginated search with query for limit, page and sort
  static searchBusinesses = async (req, res) => {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const sort = req.query.sort || "lowest";

    let sortOptions;
    if (sort === "lowest") {
      sortOptions = { "services.cost": 1 };
    } else {
      sortOptions = { "services.cost": -1 };
    }

    try {
      const businesses = await Business.find()
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(limit);

      res.status(200).json(businesses);
    } catch (error) {
      res.status(500).json(error);
    }
  };

  //controller function to list services for a particular business
  static listServices = async (req, res) => {
    try {
      const business = await Business.findById(req.params.businessId);
      if (!business) {
        return res.status(404).json({ msg: "No business with matching id" });
      }
      res.status(200).json(business.services);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  //controller function to list time slots
  static listTimeSlots = async (req, res) => {
    try {
      const business = await Business.findById(req.params.businessId);
      if (!business) {
        return res.status(404).json({ msg: "No business with matching id" });
      }
      const today = new Date().getDay();
      const currentTime = `${new Date().getHours()}:${new Date().getMinutes()}`;
      let timeSlots = [];

      // Find the current day in the business's work schedule
      const currentDay = business.workSchedule.find(
        (day) => convertDayToNumber(day.day) === today
      );
      if (currentDay) {
        // If the business is open today, create a list of time slots for the current day
        const slotsOfTheDay = {};
        slotsOfTheDay["day"] = currentDay.day;
        slotsOfTheDay.slots = [];
        for (
          let i = currentTime;
          compareTime(currentTime, currentDay.endTime) === true;
          i = addMinutes(i, 45)
        ) {
          if (i.endsWith("PM" || i.endsWith("AM"))) {
            slotsOfTheDay.slots.push(i);
          } else {
            let toPush = make12Hour(i);
            slotsOfTheDay.slots.push(toPush);
          }
        }
        timeSlots.push(slotsOfTheDay);
      }

      // Create a list of time slots for the next 6 days
      for (let i = 1; i < 7; i++) {
        const currDay = business.workSchedule.find(
          (currDay) => convertDayToNumber(currDay.day) === (today + i) % 7
        );
        if (currDay) {
          const slotsOfTheDay = {};

          slotsOfTheDay["day"] = currDay.day;
          slotsOfTheDay.slots = [];
          for (
            let j = currDay.startTime;
            compareTime(j, currDay.endTime) === true;
            j = addMinutes(j, 45)
          ) {
            if (j.endsWith("PM") || j.endsWith("AM")) {
              slotsOfTheDay.slots.push(j);
            } else {
              let toPush = make12Hour(j);
              slotsOfTheDay.slots.push(toPush);
            }
          }
          timeSlots.push(slotsOfTheDay);
        }
      }
      res.json(timeSlots);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }

    //helper function to compare time
    //input format: currentTime can be either 12 or 24 hr, endTime in 12hr format
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

    //helper function to convert the day to a number
    function convertDayToNumber(day) {
      const dayToNumber = {
        Sunday: 0,
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6,
      };
      return dayToNumber[day];
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
  };

  static generateReport = async (req, res) => {
    try {
      //Find Business to get the cost for particular service
      const business = await Business.findById(req.params.businessId);

      // Find bookings for the current month and the specified business
      let bookings = await Booking.find({
        business: req.params.businessId,
      });
      
    //   console.log("Before filtering:",bookings);
      
      bookings = bookings.filter((booking) => {
        // console.log(booking.timing.date);
        let bookingDate = new Date(booking.timing.date+' 09:45');
        // console.log("Date of booking is:",bookingDate)
        let bookingMonth = bookingDate.getMonth();
        // console.log("Month of booking is:",bookingMonth)
        // console.log("Current month is:",new Date().getMonth());
        // console.log("Is date of booking less than current date? :",bookingDate<=new Date());
        return (
          bookingMonth === new Date().getMonth()
        );
      });

      // Calculate total revenue earned and revenue lost, and create an array of booked services
      const report = bookings.reduce(
        (acc, booking) => {
          let cost = business.services.find(
            (service) => service.name === booking.service
          ).cost;
          acc.totalRevenue += cost;
          if (booking.cancelled) {
            acc.revenueLost += cost;
          } else {
            acc.bookedServices.push(booking);
          }
          return acc;
        },
        { totalRevenue: 0, revenueLost: 0, bookedServices: [] }
      );
      res.json(report);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
}
