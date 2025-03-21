const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

router.get("/", (req, res) => {
    console.log("GET /order");
    orderController.getOrderForm(req, res);
});
router.post("/", (req, res) => {
    console.log("POST /order");
    orderController.placeOrder(req, res);
});
router.get("/orders", (req, res) => {
    console.log("GET /order/orders");
    orderController.getOrders(req, res);
});

module.exports = router;
