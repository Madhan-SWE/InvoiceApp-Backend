const adminOps = require("express").Router();

const mongodb = require("mongodb");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwt_decode = require("jwt-decode");

const ObjectId = mongodb.ObjectID;

const dbUrl = process.env.DBURL;
const dbName = process.env.DBNAME;

console.log(dbUrl);
console.log(dbName);

adminOps.post("/registerAdmin", async (req, res) => {

    try {
        
        let client = await mongodb.connect(dbUrl);
        let db = client.db(dbName);
        let data = req.body;
        let salt = await bcrypt.genSalt(8);
        let result = await db
            .collection("users")
            .findOne({ email: data.email });

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


        result = await db.collection("users").insertOne(data);
        res.status(200).json({
            message: "User added successfully",
            status: 200,
            result: true,
        });
        console.log("hello from here")
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Internal server error",
            status: 500,
            result: false,
        });
    }
})

adminOps.post("/createOrg", async (req, res) => {

    try {
        
        let client = await mongodb.connect(dbUrl);
        let db = client.db(dbName);
        let data = req.body;

        let result = await db
            .collection("orgs")
            .findOne({ name: data.name });

        if (result) {
            res.status(409).json({
                result: false,
                status: 409,
                message: "Organization Already exists!",
            });
            return;
        }

        result = await db.collection("orgs").insertOne(data);
        res.status(200).json({
            message: "Org added successfully",
            status: 200,
            result: true,
        });

    } 
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Internal server error",
            status: 500,
            result: false,
        });
    }
});

adminOps.post("/addItem", async (req, res) => {

    try {
        
        let client = await mongodb.connect(dbUrl);
        let db = client.db(dbName);
        let data = req.body;

        let result = await db
            .collection("items")
            .findOne({ name: data.name, orgId: ObjectId(data.orgId) });
        
        if (result) {
            res.status(409).json({
                result: false,
                status: 409,
                message: "Item Already exists!",
            });
            return;
        }

        
        data.orgId = ObjectId(data.orgId);
        result = await db.collection("items").insertOne(data);
        res.status(200).json({
            message: "Item added successfully",
            status: 200,
            result: true,
        });

    } 
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Internal server error",
            status: 500,
            result: false,
        });
    }
});




adminOps.post("/addCustomer", async (req, res) => {

    try {
        
        let client = await mongodb.connect(dbUrl);
        let db = client.db(dbName);
        let data = req.body;

        let result = await db
            .collection("customers")
            .findOne({ email: data.email });
        
        if (result) {
            res.status(409).json({
                result: false,
                status: 409,
                message: "Customer Already exists!",
            });
            return;
        }

        data.orgId = ObjectId(data.orgId);
        result = await db.collection("customers").insertOne(data);
        res.status(200).json({
            message: "Customer added successfully",
            status: 200,
            result: true,
        });

    } 
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Internal server error",
            status: 500,
            result: false,
        });
    }
});








module.exports = adminOps;