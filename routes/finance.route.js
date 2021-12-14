const express = require('express');
const controller = require('../controllers/finance.controller');

const router = express.Router();

router.get('/indicators/:code', controller.index);
router.get("/search/:code", controller.search)
router.get("/canslim/:code", controller.canslim);
router.get("/filter/", controller.filter);
router.get("/balance-sheet/:code", controller.balanceSheet)

module.exports = router;