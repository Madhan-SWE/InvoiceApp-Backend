const itemAPIs = require("express").Router();

const mongodb = require("mongodb");

const ObjectId = mongodb.ObjectID;
const dbUrl = process.env.DBURL;
const dbName = process.env.DBNAME;

/* Items related Operations */
itemAPIs.post("/items", async (req, res) => {

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

itemAPIs.post("/items/:orgId", async (req, res) => {

    try {
        
        let client = await mongodb.connect(dbUrl);
        let db = client.db(dbName);
        let orgId = ObjectId(req.params.orgId);

        let result = await db.collection("items").find({ orgId: orgId });
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

itemAPIs.post("/items/:orgId/:itemId", async (req, res) => {

    try {
        
        let client = await mongodb.connect(dbUrl);
        let db = client.db(dbName);
        let itemId = ObjectId(req.params.itemId);
        let orgId = ObjectId(req.params.orgId);

        let result = await db.collection("items").findOne({ _id: itemId, orgId: orgId });
        if (!result) {
            res.status(404).json({
                message: "Item not found!",
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

itemAPIs.put("/items/:orgId/:itemId", async (req, res) => {

    try {
        
        let client = await mongodb.connect(dbUrl);
        let db = client.db(dbName);
        let itemId = ObjectId(req.params.itemId);
        let orgId = ObjectId(req.params.orgId);
        let data = req.body;
        data.orgId = ObjectId(orgId)
        let result = await db.collection("items").findOne({ _id: itemId, orgId: orgId });
        if (!result) {
            res.status(404).json({
                message: "Item not found!",
                result: false,
                status: 404,
            });
            return;
        }

        
        result = await db.collection("items").updateOne({
            _id: itemId
        },
        {
            $set: {
                ...data
            }
        });

        console.log(result)

        res.status(200).json({
            message: "Item details updated successfully",
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

itemAPIs.delete("/items/:orgId/:itemId", async (req, res) => {

    try {
        
        let client = await mongodb.connect(dbUrl);
        let db = client.db(dbName);
        let itemId = ObjectId(req.params.itemId);
        let orgId = ObjectId(req.params.orgId);

        let result = await db.collection("items").findOne({ _id: itemId, orgId: orgId });
        if (!result) {
            res.status(404).json({
                message: "Item not found!",
                result: false,
                status: 404,
            });
            return;
        }

        result = await db.collection("items").deleteOne({
            _id: itemId,
            orgId: orgId
        });

        res.status(200).json({
            message: "items deleted successfully",
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

module.exports = itemAPIs;