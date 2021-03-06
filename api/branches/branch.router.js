const { 
    readallbranch,
    readonebranch,
    createbranch,
    updatebranch,
    deletebranch,
    view_inventory_controller,
    readallbranch2
 } = require("./branch.controller");


const router = require("express").Router();

router.get('/alltw', readallbranch2);
router.get('/all', readallbranch);
router.get('/:id', readonebranch);
router.post('/', createbranch);
router.put('/', updatebranch);
router.delete('/:id', deletebranch)
router.post('/getinventory',view_inventory_controller);


module.exports = router;