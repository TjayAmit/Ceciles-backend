const { 
    readallproduct,
    readoneproduct,
    createproduct,
    updateproduct,
    deleteproduct,
    import_masterlist_controller,
    readmanufacturer
 } = require("./product.controller");


const router = require("express").Router();

router.get('/all', readallproduct);
router.get('/manufacturer',readmanufacturer);
router.get('/getproduct/:id', readoneproduct);
router.post('/', createproduct);
router.put('/', updateproduct);
router.delete('/:id', deleteproduct);
router.post('/import',import_masterlist_controller);

module.exports = router;