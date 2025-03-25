const express = require("express");
const router = express.Router();
const Reservation = require("../models/Reservation");
const { isAuthenticated } = require("../middleware/isAuthenticated");
const { Op } = require("sequelize");


router.get("/", isAuthenticated, (req, res) => {
    const selectedDate = req.query.date || new Date().toISOString().slice(0, 10);
    console.log("Selected Date:", selectedDate);

    // Создаем даты для диапазона (начало и конец выбранного дня)
    const startDate = new Date(selectedDate);
    const endDate = new Date(selectedDate);
    endDate.setDate(endDate.getDate() + 1);
    
    Reservation.findAll({
        where: {
            date: {
                [Op.gte]: startDate,
                [Op.lt]: endDate,
            },
        },
    })
    .then((occupiedTables) => {
        // console.log("Occupied Tables:", occupiedTables);
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
    console.log(req.body); // Add this line
    const { customerName, tableNumber, date, time, people, preOrder } = req.body;
    const userId = req.user.id;

    // Проверка наличия обязательных полей
    if (!tableNumber) {
        return res.status(400).send("Please select a table");
    }

    Reservation.create({
        userId: userId,
        customerName: customerName,
        tableNumber: tableNumber,
        date: date,
        time: time,
        people: people,
        preOrder: preOrder,
        status: "Pending"
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
