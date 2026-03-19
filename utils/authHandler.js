let jwt = require("jsonwebtoken");
let userController = require("../controllers/users");

module.exports = {
  checkLogin: async function (req, res, next) {
    try {

      let authHeader = req.headers.authorization;

      // kiểm tra header
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).send("ban chua dang nhap");
      }

      // lấy token
      let token = authHeader.split(" ")[1];

      // verify token
      let result = jwt.verify(token, "secret");

      // kiểm tra hạn token
      if (result.exp * 1000 < Date.now()) {
        return res.status(403).send("token het han");
      }

      // tìm user
      let user = await userController.FindUserById(result.id);

      if (!user) {
        return res.status(401).send("nguoi dung khong ton tai");
      }

      // lưu user vào request
      req.user = user;

      next();

    } catch (error) {
      return res.status(401).send("token khong hop le");
    }
  }
};