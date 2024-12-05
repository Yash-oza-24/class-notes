const express = require("express")
const router = express.Router();
const userController = require('../Controllers/userController')

router.post("/login", userController.loginUser)

router.post("/register", userController.registerUser)

router.post("/forgot-password", userController.forgotPassword);


module.exports = router;