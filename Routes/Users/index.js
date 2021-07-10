const userAPIs = require("express").Router();

const mongodb = require("mongodb");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const ObjectId = mongodb.ObjectID;
const dbUrl = process.env.DBURL;
const dbName = process.env.DBNAME;

const randomstring = require("randomstring");
frontEnd = "";

const {
    authorizeUser,
    allowPermittedUser,
    allowPermittedAccess,
} = require("../../MiddleWares/authentication");

const { sendMail } = require("../../Utils/mail");

userAPIs.post(
    "/admin/register",
    allowPermittedUser(["admin"]),
    async (req, res) => {
        try {
            let client = await mongodb.connect(dbUrl);
            let db = client.db(dbName);
            let data = req.body;
            let salt = await bcrypt.genSalt(8);
            let result = await db
                .collection("users")
                .findOne({ email: data.email, userType: "admin" });

            if (result) {
                res.status(409).json({
                    result: false,
                    status: 409,
                    message: "User Already exists!",
                });
                return;
            }

            data.password = await bcrypt.hash(data.password, salt);
            data.userType = "admin";
            data.userOrg = "*";
            data.access = "1111";
            data.status = "inactive";
            data.token = randomstring.generate();

            if (data.manager === undefined) {
                data.manager = "*";
            }
            console.log(data);

            result = await db.collection("users").insertOne(data);
            res.status(200).json({
                message: "User added successfully",
                status: 200,
                result: true,
            });
            console.log("hello from here");
        } catch (err) {
            console.log(err);
            res.status(500).json({
                message: "Internal server error",
                status: 500,
                result: false,
            });
        }
    }
);

userAPIs.post(
    "/manager/register",
    allowPermittedUser(["admin"]),
    async (req, res) => {
        try {
            let client = await mongodb.connect(dbUrl);
            let db = client.db(dbName);
            let data = req.body;
            let salt = await bcrypt.genSalt(8);
            let result = await db
                .collection("users")
                .findOne({ email: data.email, userType: "manager" });

            if (result) {
                res.status(409).json({
                    result: false,
                    status: 409,
                    message: "User Already exists!",
                });
                return;
            }

            data.password = await bcrypt.hash(data.password, salt);
            data.userType = "manager";
            data.userOrg = ObjectId(data.userOrg);
            data.access = "1111";
            data.status = "inactive";
            data.token = randomstring.generate();

            if (data.manager === undefined) {
                data.manager = "*";
            } else {
                data.manager = ObjectId(data.manager);
            }
            console.log(data);

            result = await db.collection("users").insertOne(data);
            res.status(200).json({
                message: "User added successfully",
                status: 200,
                result: true,
            });
            console.log("hello from here");
        } catch (err) {
            console.log(err);
            res.status(500).json({
                message: "Internal server error",
                status: 500,
                result: false,
            });
        }
    }
);

userAPIs.post(
    "/manager/employee/register",
    allowPermittedUser(["admin", "manager"]),
    async (req, res) => {
        try {
            let client = await mongodb.connect(dbUrl);
            let db = client.db(dbName);
            let data = req.body;
            let salt = await bcrypt.genSalt(8);
            let result = await db
                .collection("users")
                .findOne({ email: data.email, userType: "standard" });

            if (result) {
                res.status(409).json({
                    result: false,
                    status: 409,
                    message: "User Already exists!",
                });
                return;
            }

            data.password = await bcrypt.hash(data.password, salt);
            data.userType = "standard";
            data.userOrg = ObjectId(data.userOrg);
            data.access = "0100";
            data.status = "inactive";
            data.token = randomstring.generate();
            data.manager = ObjectId(data.manager);

            console.log(data);

            result = await db.collection("users").insertOne(data);
            res.status(200).json({
                message: "User added successfully",
                status: 200,
                result: true,
            });
            console.log("hello from here");
        } catch (err) {
            console.log(err);
            res.status(500).json({
                message: "Internal server error",
                status: 500,
                result: false,
            });
        }
    }
);

userAPIs.get("/active/:token", async (req, res) => {
    try {
        let client = await mongodb.connect(dbUrl);
        let db = client.db(dbName);
        let result = await db
            .collection("users")
            .findOne({ token: req.params.token });
        if (!result) {
            res.status(400).json({
                result: false,
                message: "Please enter a valid activation URL!",
                status: 400,
            });
            return;
        }

        result = await db.collection("users").findOneAndUpdate(
            {
                token: req.params.token,
            },
            {
                $set: {
                    status: "active",
                },
            }
        );

        res.status(200).json({
            message: "User Activation successful, Please Login.",
            result: true,
            status: 200,
        });
    } catch (err) {
        res.status(500).json({
            message: "Internal Server error",
            result: false,
            status: 500,
        });
    }
});

userAPIs.get("/forgotPassword/:userType/:email", async (req, res) => {
    try {
        let client = await mongodb.connect(dbUrl);
        let db = client.db(dbName);
        let email = req.params.email;
        let userType = req.params.userType;

        passwordModificationToken = randomstring.generate();

        let link =
            frontEnd +
            "/changePassword/email/" +
            email +
            "/token/" +
            passwordModificationToken;
        let message =
            "<p style='color:black;font-weight:bold'> Please click the below url to change Password</p> <br>" +
            "<a href='" +
            link +
            "'>" +
            link +
            "</a>";
        let subject = "Password Reset Link";
        // let wait = await sendMail(email, message, subject, gmailUserName, gmailPassword);

        let result = await db
            .collection("users")
            .findOne({ email: req.params.email, userType: userType });
        if (!result) {
            res.status(404).json({
                result: false,
                status: 404,
                message: "User not found!",
            });
            return;
        }

        result = await db.collection("users").findOneAndUpdate(
            {
                email: email,
                userType: userType,
            },
            {
                $set: {
                    passwordModificationToken: passwordModificationToken,
                },
            }
        );
        res.status(200).json({
            message: "Please check your email to reset password.",
            result: true,
            status: 200,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Internal server error",
            result: false,
            status: 500,
        });
    }
});

userAPIs.get("/resetPassword/:userType/:email/:token", async (req, res) => {
    try {
        let client = await mongodb.connect(dbUrl);
        let db = client.db(dbName);
        let email = req.params.email;
        let token = req.params.token;
        let userType = req.params.userType;

        console.log({ passwordResetToken: token, email: email });
        let result = await db
            .collection("users")
            .findOne({
                passwordModificationToken: token,
                email: email,
                userType: userType,
            });
        console.log(result);
        if (!result) {
            res.status(400).json({
                result: false,
                message: "Please enter a valid activation URL!",
                status: 400,
            });
            return;
        }

        res.status(200).json({
            message: "User authenticated successfully",
            result: true,
            status: 200,
        });
    } catch (err) {
        res.status(500).json({
            message: "Internal Server error",
            result: false,
            status: 500,
        });
    }
});

userAPIs.post("/changePassword/:userType/:email", async (req, res) => {
    try {
        let client = await mongodb.connect(dbUrl);
        let db = client.db(dbName);
        let newPassword = req.body.password;
        let userType = req.params.userType;

        let result = await db
            .collection("users")
            .findOne({ email: req.params.email, userType: userType });
        let salt = await bcrypt.genSalt(8);
        if (!result) {
            res.status(404).json({
                result: false,
                message: "User Not found!",
                status: 404,
            });
            return;
        }
        result = await db.collection("users").findOneAndUpdate(
            {
                email: req.params.email,
                userType: userType,
            },
            {
                $set: {
                    password: await bcrypt.hash(newPassword, salt),
                    passwordModificationToken: "",
                },
            }
        );
        res.status(200).json({
            message: "Password Reset Successful!",
            result: true,
            status: 200,
        });
    } catch (err) {
        res.status(500).json({
            message: "Internal server error",
            result: false,
            status: 500,
        });
    }
});

userAPIs.post("/login", async (req, res) => {
    try {
        let client = await mongodb.connect(dbUrl);
        let db = client.db(dbName);
        let data = await db
            .collection("users")
            .findOne({ email: req.body.email, userType: req.body.userType });
        if (data) {
            let isValid = await bcrypt.compare(
                req.body.password,
                data.password
            );
            if (isValid) {
                let token = await jwt.sign(
                    {
                        userId: data._id,
                        email: data.email,
                        firstname: data.firstname,
                        access: data.access,
                        userType: data.userType,
                    },
                    process.env.JWT_KEY,
                    { expiresIn: "24h" }
                );
                console.log("valid user", isValid);
                console.log("token", token);
                res.status(200).json({
                    result: true,
                    message: "login successful",
                    token,
                });
            } else {
                res.status(403).json({
                    result: false,
                    message: "invalid password",
                });
            }
        } else {
            res.status(401).json({
                result: false,
                message: "Email ID is not registered",
            });
        }
        client.close();
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal Server error",
            result: false,
        });
    }
});

userAPIs.put(
    "/edit/access/:email",
    allowPermittedUser(["admin", "manager"]),
    async (req, res) => {
        try {
            let client = await mongodb.connect(dbUrl);
            let db = client.db(dbName);

            let access = req.body.access;

            let result = await db
                .collection("users")
                .findOne({ email: req.params.email, userType: "standard" });

            if (!result) {
                res.status(404).json({
                    result: false,
                    message: "User Not found!",
                    status: 404,
                });
                return;
            }
            result = await db.collection("users").findOneAndUpdate(
                {
                    email: req.params.email,
                    userType: "standard",
                },
                {
                    $set: {
                        access: access,
                    },
                }
            );
            res.status(200).json({
                message: "Access Reset Successful!",
                result: true,
                status: 200,
            });
        } catch (err) {
            res.status(500).json({
                message: "Internal server error",
                result: false,
                status: 500,
            });
        }
    }
);

userAPIs.put(
    "/edit/:manager/:email",
    allowPermittedUser(["admin", "manager"]),
    async (req, res) => {
        try {
            let client = await mongodb.connect(dbUrl);
            let db = client.db(dbName);
            let manager = ObjectId(req.params.manager);
            let data = req.body;
            let result = await db
                .collection("users")
                .findOne({
                    email: req.params.email,
                    userType: "standard",
                    manager: manager,
                });

            if (!result) {
                res.status(404).json({
                    result: false,
                    message: "User Not found!",
                    status: 404,
                });
                return;
            }
            result = await db.collection("users").findOneAndUpdate(
                {
                    email: req.params.email,
                    userType: "standard",
                    manager: manager,
                },
                {
                    $set: {
                        ...data,
                    },
                }
            );
            res.status(200).json({
                message: "User Updation Successful!",
                result: true,
                status: 200,
            });
        } catch (err) {
            console.log(err);
            res.status(500).json({
                message: "Internal server error",
                result: false,
                status: 500,
            });
        }
    }
);

userAPIs.put(
    "/admin/edit/:userType/:email",
    allowPermittedUser(["admin", "manager"]),
    async (req, res) => {
        try {
            let client = await mongodb.connect(dbUrl);
            let db = client.db(dbName);
            let userType = req.params.userType;
            let data = req.body;
            let result = await db
                .collection("users")
                .findOne({ email: req.params.email, userType: userType });

            if (!result) {
                res.status(404).json({
                    result: false,
                    message: "User Not found!",
                    status: 404,
                });
                return;
            }
            result = await db.collection("users").findOneAndUpdate(
                {
                    email: req.params.email,
                    userType: userType,
                },
                {
                    $set: {
                        ...data,
                    },
                }
            );
            res.status(200).json({
                message: "User Updation Successful!",
                result: true,
                status: 200,
            });
        } catch (err) {
            console.log(err);
            res.status(500).json({
                message: "Internal server error",
                result: false,
                status: 500,
            });
        }
    }
);

userAPIs.post(
    "/users/:manager",
    allowPermittedUser(["admin", "manager"]),
    async (req, res) => {
        try {
            let client = await mongodb.connect(dbUrl);
            let db = client.db(dbName);
            let manager = ObjectId(req.params.manager);

            let result = await db.collection("users").aggregate([
                {
                    $match: {
                        manager: manager,
                    },
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "manager",
                        foreignField: "_id",
                        as: "managerDetails",
                    },
                },
                {
                    $lookup: {
                        from: "orgs",
                        localField: "userOrg",
                        foreignField: "_id",
                        as: "orgDetails",
                    },
                },
            ]);
            if (!result) {
                res.status(404).json({
                    message: "Items not found!",
                    result: false,
                    status: 404,
                });
                return;
            }

            result = await result.toArray();

            res.status(200).json({
                data: result,
                status: 200,
                result: true,
            });
        } catch (err) {
            console.log(err);
            res.status(500).json({
                message: "Internal server error",
                status: 500,
                result: false,
            });
        }
    }
);

module.exports = userAPIs;
