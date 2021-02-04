const customerAPIs = require("express").Router();

const mongodb = require("mongodb");

const ObjectId = mongodb.ObjectID;
const dbUrl = process.env.DBURL;
const dbName = process.env.DBNAME;

customerAPIs.post("/customer", async (req, res) => {

    try {
        
        let client = await mongodb.connect(dbUrl);
        let db = client.db(dbName);
        let data = req.body;
        data.orgId = ObjectId(data.orgId);

        let result = await db
            .collection("customers")
            .findOne({ email: data.email, orgId: data.orgId });
        
        if (result) {
            res.status(409).json({
                result: false,
                status: 409,
                message: "Customer Already exists!",
            });
            return;
        }

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

customerAPIs.post("/customer/:orgId", async (req, res) => {

    try {
        
        let client = await mongodb.connect(dbUrl);
        let db = client.db(dbName);
        // let customerId = ObjectId(req.params.customerId);
        let orgId = ObjectId(req.params.orgId);
        console.log(orgId)
        let result = await db.collection("customers").findOne({  orgId: orgId });
        if (!result) {
            res.status(404).json({
                message: "Customers not found!",
                result: false,
                status: 404,
            });
            return;
        }
        
        result = await db.collection("customers").aggregate([
            {
                $lookup: {
                    from: "orgs",
                    localField: "orgId",
                    foreignField: "_id",
                    as: "orgDetails"
                }
            }
        ])
        
        result = await result.toArray();

         res.status(200).json({
            data: result,
            status: 200,
            result: true,
        })

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

customerAPIs.post("/customer/:orgId/:customerId", async (req, res) => {

    try {
        
        let client = await mongodb.connect(dbUrl);
        let db = client.db(dbName);
        let customerId = ObjectId(req.params.customerId);
        let orgId = ObjectId(req.params.orgId);

        let result = await db.collection("customers").findOne({ _id: customerId, orgId: orgId });
        if (!result) {
            res.status(404).json({
                message: "Customer not found!",
                result: false,
                status: 404,
            });
            return;
        }
        
        result = await db.collection("customers").aggregate([
            {
                $lookup: {
                    from: "orgs",
                    localField: "orgId",
                    foreignField: "_id",
                    as: "orgDetails"
                }
            }
        ])
        
        result = await result.toArray();

         res.status(200).json({
            data: result,
            status: 200,
            result: true,
        })

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

customerAPIs.put("/customer/:orgId/:customerId", async (req, res) => {

    try {
        
        let client = await mongodb.connect(dbUrl);
        let db = client.db(dbName);
        let customerId = ObjectId(req.params.customerId);
        let orgId = ObjectId(req.params.orgId);
        let data = req.body;

        let result = await db.collection("customers").findOne({ _id: customerId, orgId: orgId });
        if (!result) {
            res.status(404).json({
                message: "Customer not found!",
                result: false,
                status: 404,
            });
            return;
        }

        data.orgId = ObjectId(orgId);
        result = await db.collection("customers").updateOne({
            _id: customerId
        },
        {
            $set: {
                ...data
            }
        });

        console.log(result)

        res.status(200).json({
            message: "Customer details updated successfully",
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

customerAPIs.delete("/customer/:orgId/:customerId", async (req, res) => {

    try {
        
        let client = await mongodb.connect(dbUrl);
        let db = client.db(dbName);
        let customerId = ObjectId(req.params.customerId);
        let orgId = ObjectId(req.params.orgId);

        result = await db.collection("customers").deleteOne({
            _id: customerId,
            orgId: orgId
        });

        res.status(200).json({
            message: "Customer deleted successfully",
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

module.exports = customerAPIs;