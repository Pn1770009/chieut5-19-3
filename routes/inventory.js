var express = require('express');
var router = express.Router();
let inventoryModel = require('../schemas/inventory')

/* GET all inventories */
router.get('/', async function (req, res, next) {
    let data = await inventoryModel.find().populate({
        path: 'product',
        select: 'title price description'
    });
    res.send(data);
});

/* GET inventory by ID */
router.get('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await inventoryModel.findById(id).populate({
            path: 'product',
            select: 'title price description'
        });
        if (result) {
            res.send(result)
        } else {
            res.status(404).send({
                message: "Inventory not found"
            })
        }
    } catch (error) {
        res.status(404).send({
            message: error.message
        })
    }
});

/* POST add stock */
router.post('/add-stock', async function (req, res) {
    try {
        let { product, quantity } = req.body;
        if (!product || quantity == null || quantity < 0) {
            return res.status(400).send({ message: "Invalid product or quantity" });
        }
        let inventory = await inventoryModel.findOne({ product });
        if (!inventory) {
            return res.status(404).send({ message: "Inventory not found" });
        }
        inventory.stock += quantity;
        await inventory.save();
        res.send(inventory);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

/* POST remove stock */
router.post('/remove-stock', async function (req, res) {
    try {
        let { product, quantity } = req.body;
        if (!product || quantity == null || quantity < 0) {
            return res.status(400).send({ message: "Invalid product or quantity" });
        }
        let inventory = await inventoryModel.findOne({ product });
        if (!inventory) {
            return res.status(404).send({ message: "Inventory not found" });
        }
        if (inventory.stock < quantity) {
            return res.status(400).send({ message: "Insufficient stock" });
        }
        inventory.stock -= quantity;
        await inventory.save();
        res.send(inventory);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

/* POST reservation */
router.post('/reservation', async function (req, res) {
    try {
        let { product, quantity } = req.body;
        if (!product || quantity == null || quantity < 0) {
            return res.status(400).send({ message: "Invalid product or quantity" });
        }
        let inventory = await inventoryModel.findOne({ product });
        if (!inventory) {
            return res.status(404).send({ message: "Inventory not found" });
        }
        if (inventory.stock < quantity) {
            return res.status(400).send({ message: "Insufficient stock" });
        }
        inventory.stock -= quantity;
        inventory.reserved += quantity;
        await inventory.save();
        res.send(inventory);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

/* POST sold */
router.post('/sold', async function (req, res) {
    try {
        let { product, quantity } = req.body;
        if (!product || quantity == null || quantity < 0) {
            return res.status(400).send({ message: "Invalid product or quantity" });
        }
        let inventory = await inventoryModel.findOne({ product });
        if (!inventory) {
            return res.status(404).send({ message: "Inventory not found" });
        }
        if (inventory.reserved < quantity) {
            return res.status(400).send({ message: "Insufficient reserved stock" });
        }
        inventory.reserved -= quantity;
        inventory.soldCount += quantity;
        await inventory.save();
        res.send(inventory);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

module.exports = router;