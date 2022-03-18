const {
    a_controller,
    b_controller,
    c_controller,
    d_controller,
    e_controller,
    f_controller,
    lb_controller,
    lw_controller,
    ld_controller,
    sp_controller
} = require("./model.controller");


const router = require("express").Router();

router.get('/a', a_controller);
router.get('/b', b_controller);
router.get('/c', c_controller);
router.get('/d', d_controller);
router.get('/e', e_controller);
router.get('/f', f_controller);
router.get('/listbranches', lb_controller);
router.get('/listwarehouses', lw_controller);
router.get('/listdates', ld_controller);
router.get('/searchproduct', sp_controller);


module.exports = router;