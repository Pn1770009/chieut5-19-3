var express = require("express");
var router = express.Router();

let { validatedResult, CreateUserValidator, ModifyUserValidator } = require("../utils/validator");
let userModel = require("../schemas/users");
let bcrypt = require("bcrypt");

let userController = require("../controllers/users");

const { checkLogin } = require("../utils/authHandler");


// ======================
// GET ALL USERS
// ======================

router.get("/", checkLogin, async function (req, res, next) {

  let users = await userModel.find({ isDeleted: false });

  res.send(users);

});


// ======================
// GET USER BY ID
// ======================

router.get("/:id", async function (req, res, next) {

  try {

    let result = await userModel.find({
      _id: req.params.id,
      isDeleted: false
    });

    if (result.length > 0) {
      res.send(result);
    } else {
      res.status(404).send({ message: "id not found" });
    }

  } catch (error) {

    res.status(404).send({ message: "id not found" });

  }

});


// ======================
// CREATE USER
// ======================

router.post("/", CreateUserValidator, validatedResult, async function (req, res, next) {

  try {

    let newUser = await userController.CreateAnUser(
      req.body.username,
      req.body.password,
      req.body.email,
      req.body.role,
      req.body.fullname,
      req.body.avatarUrl
    );

    res.send(newUser);

  } catch (err) {

    res.status(400).send({ message: err.message });

  }

});


// ======================
// UPDATE USER
// ======================

router.put("/:id", ModifyUserValidator, validatedResult, async function (req, res, next) {

  try {

    let id = req.params.id;

    let updatedItem = await userModel.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).send({ message: "id not found" });
    }

    let populated = await userModel.findById(updatedItem._id);

    res.send(populated);

  } catch (err) {

    res.status(400).send({ message: err.message });

  }

});


// ======================
// DELETE USER
// ======================

router.delete("/:id", async function (req, res, next) {

  try {

    let id = req.params.id;

    let updatedItem = await userModel.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).send({ message: "id not found" });
    }

    res.send(updatedItem);

  } catch (err) {

    res.status(400).send({ message: err.message });

  }

});


// ======================
// CHANGE PASSWORD
// ======================

router.post("/changePassword", checkLogin, async function (req, res, next) {

  try {

    let userId = req.user._id;

    let { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).send({
        message: "Missing oldPassword or newPassword"
      });
    }

    // validate password mới
    if (newPassword.length < 6) {
      return res.status(400).send({
        message: "New password must be at least 6 characters"
      });
    }

    let user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).send({
        message: "User not found"
      });
    }

    const match = await bcrypt.compare(oldPassword, user.password);

    if (!match) {
      return res.status(400).send({
        message: "Old password incorrect"
      });
    }

    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.send({
      message: "Password changed successfully"
    });

  } catch (err) {

    res.status(400).send({ message: err.message });

  }

});


module.exports = router;