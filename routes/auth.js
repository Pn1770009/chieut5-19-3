let express = require('express')
let router = express.Router()
let userController = require('../controllers/users')
let { RegisterValidator, validatedResult } = require('../utils/validator')
let bcrypt = require('bcrypt')
let jwt = require('jsonwebtoken')
const { check } = require('express-validator')
const { checkLogin } = require('../utils/authHandler')

/* ================= REGISTER ================= */
router.post('/register', RegisterValidator, validatedResult, async function (req, res, next) {

    let { username, password, email } = req.body;

    let newUser = await userController.CreateAnUser(
        username,
        password,
        email,
        '69b2763ce64fe93ca6985b56'
    )

    res.send(newUser)

})


/* ================= LOGIN ================= */
router.post('/login', async function (req, res, next) {

    let { username, password } = req.body;

    let user = await userController.FindUserByUsername(username);

    if (!user) {
        return res.status(404).send({
            message: "thong tin dang nhap khong dung"
        })
    }

    if (!user.lockTime || user.lockTime < Date.now()) {

        if (bcrypt.compareSync(password, user.password)) {

            user.loginCount = 0;
            await user.save();

            let token = jwt.sign({
                id: user._id
            }, 'secret', {
                expiresIn: '1h'
            })

            res.send(token)

        } else {

            user.loginCount++;

            if (user.loginCount == 3) {
                user.loginCount = 0;
                user.lockTime = new Date(Date.now() + 60 * 60 * 1000)
            }

            await user.save();

            res.status(404).send({
                message: "thong tin dang nhap khong dung"
            })
        }

    } else {

        res.status(404).send({
            message: "user dang bi ban"
        })
    }

})


/* ================= GET CURRENT USER ================= */
router.get('/me', checkLogin, function (req, res, next) {

    res.send(req.user)

})


/* ================= CHANGE PASSWORD ================= */
router.put('/change-password', checkLogin, async function (req, res, next) {

    try {

        let { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).send({
                message: "oldPassword va newPassword khong duoc de trong"
            })
        }

        // validate password mới
        if (newPassword.length < 6) {
            return res.status(400).send({
                message: "newPassword phai >= 6 ky tu"
            })
        }

        let user = await userController.FindUserById(req.user.id)

        if (!user) {
            return res.status(404).send({
                message: "user khong ton tai"
            })
        }

        // kiểm tra password cũ
        if (!bcrypt.compareSync(oldPassword, user.password)) {
            return res.status(400).send({
                message: "mat khau cu khong dung"
            })
        }

        // hash password mới
        let salt = bcrypt.genSaltSync(10)
        let hash = bcrypt.hashSync(newPassword, salt)

        user.password = hash

        await user.save()

        res.send({
            message: "doi mat khau thanh cong"
        })

    } catch (error) {

        res.status(500).send({
            message: error.message
        })

    }

})

module.exports = router