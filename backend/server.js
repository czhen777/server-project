const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express();

app.use(express.json());


// =============================
// MongoDB Schema
// =============================

const profileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    department: {
      type: String,
      default: ""
    },

    introduction: {
      type: String,
      default: ""
    },

    interests: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

const Profile = mongoose.model("Profile", profileSchema);

// =============================
// JWT 驗證 Middleware
// =============================

function authenticateToken(req, res, next) {

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "尚未登入"
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Token 不存在"
    });
  }

  try {

    const user = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = user;

    next();

  } catch (error) {

    return res.status(403).json({
      message: "Token 無效或已過期"
    });

  }
}


// =============================
// Backend 測試
// =============================

app.get("/api/hello", (req, res) => {

  res.json({
    message: "Backend is working!"
  });

});


// =============================
// 登入
// =============================

app.post("/api/login", async (req, res) => {

  const { username, password } = req.body;

  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    !username ||
    !password
  ) {
    return res.status(400).json({
      message: "請輸入帳號與密碼"
    });
  }

  try {

    // 檢查帳號
    const validUsername =
      username === process.env.ADMIN_USERNAME;

    // 使用 bcrypt 驗證密碼
    const validPassword = await bcrypt.compare(
      password,
      process.env.ADMIN_PASSWORD_HASH
    );

    if (!validUsername || !validPassword) {
      return res.status(401).json({
        message: "帳號或密碼錯誤"
      });
    }

    // 登入成功後產生 JWT
    const token = jwt.sign(
      { username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "登入成功",
      token: token
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "登入發生錯誤"
    });

  }

});

// =============================
// 取得 Profile
// =============================

app.get("/api/profile", async (req, res) => {

  try {

    let profile = await Profile.findOne();

    if (!profile) {

      profile = await Profile.create({

        name: "你的名字",

        department: "你的系級",

        introduction: "請在這裡放你的個人介紹",

        interests: [
          "興趣一",
          "興趣二"
        ]

      });

    }

    res.json(profile);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "讀取個人資料失敗"
    });

  }

});


// =============================
// 修改 Profile
// 必須登入
// =============================

app.put(
  "/api/profile",
  authenticateToken,
  async (req, res) => {

    try {

      const {
        name,
        department,
        introduction,
        interests
      } = req.body;

      if (!name) {

        return res.status(400).json({
          message: "姓名不能空白"
        });

      }

      let profile = await Profile.findOne();

      const profileData = {

        name: name.trim(),

        department:
          department ? department.trim() : "",

        introduction:
          introduction ? introduction.trim() : "",

        interests:
          Array.isArray(interests)
            ? interests
            : []

      };

      if (!profile) {

        profile = await Profile.create(profileData);

      } else {

        Object.assign(
          profile,
          profileData
        );

        await profile.save();

      }

      res.json({
        message: "資料修改成功",
        profile: profile
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        message: "修改資料失敗"
      });

    }

  }
);


// =============================
// Start Server
// =============================

async function startServer() {

  try {

    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log("MongoDB connected");

    app.listen(
      3000,
      "0.0.0.0",
      () => {

        console.log(
          "Backend running on port 3000"
        );

      }
    );

  } catch (error) {

    console.error(
      "MongoDB connection failed:",
      error
    );

    setTimeout(
      startServer,
      5000
    );

  }

}

startServer();
