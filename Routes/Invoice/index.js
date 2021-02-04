const invoiceAPIs = require("express").Router();

const mongodb = require("mongodb");

const ObjectId = mongodb.ObjectID;
const dbUrl = process.env.DBURL;
const dbName = process.env.DBNAME;


/* Invoice Operations */
invoiceAPIs.post("/invoice", async (req, res) => {

    try {
        
        let client = await mongodb.connect(dbUrl);
        let db = client.db(dbName);
        let data = req.body;
        data.customerId = ObjectId(data.customerId);
        data.userId = ObjectId(data.userId);
        data.orgId = ObjectId(data.orgId);
        let n = data.items;
        for(let i=0;i<n;i++)
        {
            data.items[i].itemId = ObjectId(data.items[i].itemId);
        }

        
        data.created = new Date();
        data.updated = new Date();
        result = await db.collection("invoice").insertOne(data);
        res.status(200).json({
            message: "Invoice added successfully",
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

invoiceAPIs.post("/invoice/:invoiceId", async (req, res) => {

    try {
        
        let client = await mongodb.connect(dbUrl);
        let db = client.db(dbName);
        console.log(req.params.invoiceId);
        console.log(req.params.invoiceId.length)
        let invoiceId = ObjectId(req.params.invoiceId);

        let result = await db.collection("invoice").findOne({ _id: invoiceId });
        if (!result) {
            res.status(404).json({
                message: "Invoice not found",
                result: false,
                status: 404,
            });
            return;
        }
        
        result = await db.collection("invoice").aggregate([
            {
                $lookup: {
                    from: "customers",
                    localField: "customerId",
                    foreignField: "_id",
                    as: "customerDetails"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            {
                $lookup: {
                    from: "orgs",
                    localField: "orgId",
                    foreignField: "_id",
                    as: "orgDetails"
                }
            },
            // {
            //     $unwind: "$items"
            // },
            {
                $lookup: {
                    from: "items",
                    localField: "items.itemId",
                    foreignField: "_id",
                    as: "ItemsList"
                }
            },

        ])
        
        result = await result.toArray();
        console.log(result)
        console.log(result[0].customerDetails[0]);

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

invoiceAPIs.put("/invoice/:invoiceId", async (req, res) => {

    try {
        
        let client = await mongodb.connect(dbUrl);
        let db = client.db(dbName);
        let data = req.body;
        data.customerId = ObjectId(data.customerId);
        data.userId = ObjectId(data.userId);
        data.orgId = ObjectId(data.orgId);
        let invoiceId = ObjectId(req.params.invoiceId);

        let n = data.items.length;
        for(let i=0;i<n;i++)
        {
            data.items[i].itemId = ObjectId(data.items[i].itemId);
        }

        console.log(data);

        data.updated = new Date();
        result = await db.collection("invoice").updateOne({
            _id: invoiceId
        },
        {
            $set: {
                ...data
            }
        });

        console.log(result)

        res.status(200).json({
            message: "Invoice updated successfully",
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

invoiceAPIs.delete("/invoice/:invoiceId", async (req, res) => {

    try {
        
        let client = await mongodb.connect(dbUrl);
        let db = client.db(dbName);
        let data = req.body;
        let invoiceId = ObjectId(req.params.invoiceId);

        data.updated = new Date();
        result = await db.collection("invoice").deleteOne({
            _id: invoiceId
        });

        res.status(200).json({
            message: "Invoice deleted successfully",
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

module.exports = invoiceAPIs;