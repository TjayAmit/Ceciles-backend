const {
    getAllDistributions_controller,
    saveDistribution_controller,
    getDistribution_controller,
    getDistributionD_controller,
    editDistribution_controller,
    deleteDistribution_controller,
    searchproduct_controller,
    listdates_controller,
    generateDistribution_controller,
    getDistributionAlloDate_controller,
} = require("./Distribution.controller");


const router = require("express").Router();

router.get('/all', getAllDistributions_controller);
router.post('/bybranches', getDistribution_controller);
router.post('/bydate', getDistributionAlloDate_controller);
router.post('/', getDistributionD_controller);
router.get('/searchDistribution', searchproduct_controller);
router.get('/listdates', listdates_controller);
router.post('/save', saveDistribution_controller);
router.delete('/', deleteDistribution_controller);
router.put('/', editDistribution_controller);
router.put('/generatedistribution', generateDistribution_controller);

module.exports = router;