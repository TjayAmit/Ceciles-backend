const { 
    readallmodifier,
    readonemodifier,
    createmodifier,
    updatemodifier,
    deletemodifier
 } = require("./modifier.controller");


const router = require("express").Router();

router.get('/all', readallmodifier);
router.get('/:id', readonemodifier);
router.post('/', createmodifier);
router.put('/:id', updatemodifier);
router.delete('/:id', deletemodifier)


module.exports = router;