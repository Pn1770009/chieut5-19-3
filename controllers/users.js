let userModel = require('../schemas/users')
const bcrypt = require("bcryptjs")

module.exports = {

    CreateAnUser: async function (
        username, password, email, role, fullname, avatarUrl, status, loginCount) {

        let newUser = new userModel({
            username: username,
            password: password,
            email: email,
            fullName: fullname,
            avatarUrl: avatarUrl,
            status: status,
            role: role,
            loginCount: loginCount
        });

        await newUser.save();

        return newUser;
    },

    FindUserByUsername: async function (username) {

        return await userModel.findOne({
            username: username,
            isDeleted: false
        })

    },

    FindUserById: async function (id) {

        try {

            return await userModel.findOne({
                _id: id,
                isDeleted: false
            })

        } catch (error) {

            return false

        }

    },

    // =========================
    // CHANGE PASSWORD
    // =========================

    ChangePassword: async function (userId, oldPassword, newPassword) {

        if (!oldPassword || !newPassword) {
            throw new Error("Missing password")
        }

        // validate password mới
        if (newPassword.length < 6) {
            throw new Error("New password must be at least 6 characters")
        }

        let user = await userModel.findById(userId)

        if (!user) {
            throw new Error("User not found")
        }

        // kiểm tra password cũ
        const isMatch = await bcrypt.compare(oldPassword, user.password)

        if (!isMatch) {
            throw new Error("Old password incorrect")
        }

        // mã hoá password mới
        const salt = await bcrypt.genSalt(10)

        user.password = await bcrypt.hash(newPassword, salt)

        await user.save()

        return true

    }

}