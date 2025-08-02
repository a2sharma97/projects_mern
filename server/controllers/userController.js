const { success } = require("zod");
const { User } = require("../config/mongodb");
const getUserData = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not fount " });
    }

    res.json({
      success: true,
      userData: {
        firstName: user.firstName,
        lastName: user.lastName,
        isAccountVerified: user.isAccountVerified,
      },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

module.exports = getUserData;
