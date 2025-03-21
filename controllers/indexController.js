const Dish = require("../models/Dish"); // Import the Dish model

exports.home = (req, res) => {
    Dish.findAll()
        .then((dishes) => {
            res.render("home", { dishes: dishes });
        })
        .catch((err) => {
            console.error("Error fetching dishes:", err);
            res.status(500).send("Error fetching dishes");
        });
};
