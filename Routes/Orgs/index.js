const orgAPIs = require("express").Router();

const mongodb = require("mongodb");

const ObjectId = mongodb.ObjectID;
const dbUrl = process.env.DBURL;
const dbName = process.env.DBNAME;


orgAPIs.post("/orgs", async (req, res) => {

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

orgAPIs.post("/orgs/list", async (req, res) => {

    try {
        
        let client = await mongodb.connect(dbUrl);
        let db = client.db(dbName);

        let result = await db.collection("orgs").find();
        if (!result) {
            res.status(404).json({
                message: "Orgs not found!",
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

orgAPIs.put("/orgs/:orgId", async (req, res) => {

    try {
        
        let client = await mongodb.connect(dbUrl);
        let db = client.db(dbName);
        let orgId = ObjectId(req.params.orgId);
        let data = req.body;
        data.orgId = ObjectId(orgId)
        let result = await db.collection("orgs").findOne({ _id: orgId });
        if (!result) {
            res.status(404).json({
                message: "Org not found!",
                result: false,
                status: 404,
            });
            return;
        }

        
        result = await db.collection("orgs").updateOne({
            _id: orgId
        },
        {
            $set: {
                ...data
            }
        });

        console.log(result)

        res.status(200).json({
            message: "Org details updated successfully",
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

orgAPIs.delete("/orgs/:orgId", async (req, res) => {

    try {
        
        let client = await mongodb.connect(dbUrl);
        let db = client.db(dbName);
        let orgId = ObjectId(req.params.orgId);

        console.log(orgId)
        let result = await db.collection("orgs").findOne({ _id: orgId });
        if (!result) {
            res.status(404).json({
                message: "Org not found!",
                result: false,
                status: 404,
            });
            return;
        }

        result = await db.collection("orgs").deleteOne({
            _id: orgId
        });

        res.status(200).json({
            message: "Org deleted successfully",
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

module.exports = orgAPIs;