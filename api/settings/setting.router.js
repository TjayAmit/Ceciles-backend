const {
    getsetting,
    editsetting
} = require("./setting.controller");


const router = require("express").Router();

router.get('/get', getsetting);
router.put('/edit', editsetting);



module.exports = router;