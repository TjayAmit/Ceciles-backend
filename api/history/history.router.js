const {
    getHistory_controller,
    getHistoryCondition_controller,
    getHistoryCondition2_controller,
    listdates_controller
} = require('./history.controller')

const router = require("express").Router();

router.get('/save',getHistory_controller);
router.post('/getcondition',getHistoryCondition_controller);
router.post('/getcondition2',getHistoryCondition2_controller);
router.get('/date',listdates_controller);


module.exports = router;