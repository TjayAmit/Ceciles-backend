const { 
    readallproduct,
    readoneproduct,
    createproduct,
    updateproduct,
    deleteproduct
 } = require("./product.controller");


const router = require("express").Router();

router.get('/all', readallproduct);
router.get('/:id', readoneproduct);
router.post('/', createproduct);
router.put('/:id', updateproduct);
router.delete('/:id', deleteproduct)


module.exports = router;