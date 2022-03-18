const { 
    readallbranch,
    readonebranch,
    createbranch,
    updatebranch,
    deletebranch
 } = require("./branch.controller");


const router = require("express").Router();

router.get('/all', readallbranch);
router.get('/:id', readonebranch);
router.post('/', createbranch);
router.put('/', updatebranch);
router.delete('/:id', deletebranch)


module.exports = router;