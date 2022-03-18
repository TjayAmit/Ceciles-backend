const { 
    readallvariation,
    readonevariation,
    createvariation,
    updatevariation,
    deletevariation
 } = require("./variation.controller");


const router = require("express").Router();

router.get('/all', readallvariation);
router.get('/:id', readonevariation);
router.post('/', createvariation);
router.put('/:id', updatevariation);
router.delete('/:id', deletevariation)


module.exports = router;