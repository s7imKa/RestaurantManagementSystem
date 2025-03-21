const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

router.get("/", adminController.getAdminDashboard);
router.get("/orders", adminController.getOrders);
router.get("/reservations", adminController.getReservations);
router.get("/dishes", adminController.getDishes);
router.post("/addDish", adminController.addDish);
router.post("/deleteDish/:id", adminController.deleteDish);
router.post("/updateOrder/:id", adminController.updateOrder);

module.exports = router;
