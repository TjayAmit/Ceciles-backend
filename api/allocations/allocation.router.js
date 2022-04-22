const {
    getAllAllocations_controller,
    getAllocationSummary_controller,
    getAllocationSummaryWzero_controller,
    addAllocation_controller,
    getAllocation_controller,
    editAllocation_controller,
    deleteAllocation_controller,
    searchproduct_controller,
    savefinalAllocation_controller,
    importCSVSales_controller,
    importCSVStock_controller,
    ImportCSVProcess2_controller,
    ImportCSVProcess3_controller
} = require("./allocation.controller");


const router = require("express").Router();

router.get('/all', getAllAllocations_controller);
router.get('/as',getAllocationSummary_controller);
router.get('/asw',getAllocationSummaryWzero_controller);
router.post('/bybranches', getAllocation_controller);
router.get('/searchallocation', searchproduct_controller);
router.post('/add', addAllocation_controller);
router.delete('/delete/:id', deleteAllocation_controller);
router.put('/', editAllocation_controller);
router.post('/saveallocation',savefinalAllocation_controller);
router.post('/importsales',importCSVSales_controller);
router.post('/importstock',importCSVStock_controller);
router.post('/importprocess2',ImportCSVProcess2_controller);
router.post('/importprocess3',ImportCSVProcess3_controller);

module.exports = router;