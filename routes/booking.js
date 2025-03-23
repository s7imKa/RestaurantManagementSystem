const express = require("express");
const router = express.Router();
const Reservation = require("../models/Reservation");
const { isAuthenticated } = require("../middleware/isAuthenticated");

router.get("/", isAuthenticated, (req, res) => {
    const selectedDate =
        req.query.date || new Date().toISOString().slice(0, 10);

    Reservation.findAll({
        where: {
            date: selectedDate,
        },
    })
        .then((occupiedTables) => {
            res.render("booking", {
                occupiedTables: occupiedTables,
                selectedDate: selectedDate,
            });
        })
        .catch((err) => {
            console.error("Error fetching occupied tables:", err);
            res.status(500).send("Error fetching occupied tables");
        });
});

router.post("/", isAuthenticated, (req, res) => {
    const { customerName, tableNumber, date, time, people } = req.body;
    const userId = req.user.id; // Add this line

    Reservation.create({
        userId: userId, // Add this line
        customerName: customerName,
        tableNumber: tableNumber,
        date: date,
        time: time,
        people: people,
    })
        .then(() => {
            res.redirect("/");
        })
        .catch((err) => {
            console.error("Error creating reservation:", err);
            res.status(500).send("Error creating reservation");
        });
});

module.exports = router;
