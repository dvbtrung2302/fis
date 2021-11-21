const express = require('express');
const controller = require('../controllers/finance.controller');

const router = express.Router();

router.get('/:code', controller.index);
router.get("/search/:code", controller.search)

module.exports = router;