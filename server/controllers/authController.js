const User = require("../models/user");
const { hashPassword, comparePassword } = require("../utils/auth");
const jwt = require("jsonwebtoken");

const test = (req, res) => {
    res.send("Hello from the server!");
}

// Register endpoint
const registerUser = async (req, res) => {

    try {

        const { username, fullName, email, password } = req.body;

        // Check if fullName was entered
        if (!fullName) {
            return res.json({
                error: "Name is required"
            });
        }

        // Check if password is good
        if (!password || password.length < 6) {
            return res.json({
                error: "Password is required and should be at least 6 characters long"
            });
        }

        // Check if username was exists
        const unameExist = await User.findOne({ username });

        if (unameExist) {
            return res.json({
                error: "username already exists"
            })
        }

        // Check if email was exists
        const exist = await User.findOne({ email });

        if (exist) {
            return res.json({
                error: "Email already exists"
            })
        }

        const hashedPassword = await hashPassword(password);
        // Create new user
        const user = new User({
            image: "",
            username,
            fullName,
            email,
            website: "",
            bio: "",
            password: hashedPassword
        });
        await user.save();

        res.json(
            {
                message: "User created successfully!",
                fullName,
                email,
                hashedPassword
            }
        );

    } catch (error) {
        res.json({
            error: `Server error: ${error}`
        })
    }
}

// Login endpoint
const loginUser = async (req, res) => {
    try {

        const { email, password } = req.body;

        // Check if email exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({
                error: "Email does not exist"
            });
        }

        // Check if password is correct
        const match = await comparePassword(password, user.password);

        if (match) {
            jwt.sign({ email: user.email, id: user._id, fullName: user.fullName }, process.env.JWT_SECRET, {}, (err, token) => {
                if (err) throw err;
                res.cookie("token", token).json(user)
            })
        } else {
            return res.json({
                error: "Password is incorrect"
            });
        }

    } catch (error) {

        console.log(error);
        res.json({
            error: `Server error: ${error}`
        })
    }
};

// Get profile endpoint
const getProfile = (req, res) => {
    const { token } = req.cookies;
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, {}, (err, user) => {
            if (err) throw err;
            res.json(user);
        })
    } else {
        res.json(null);
    }
}

module.exports = {
    test,
    registerUser,
    loginUser,
    getProfile
}
