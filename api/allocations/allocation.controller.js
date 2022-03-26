const { 
    getAllAllocations,
    getAllocationSummary,
    getAllocation,
    addAllocation,
    editAllocation,
    deleteAllocation,
    searchproduct,
    savefinalAllocation,
    deleteProductOfftakes,
    deleteStockStatus,
    importCSVSales,
    importCSVStock,
    deleteInventory,
    getBranches,
    truncateAllocation,
    fetchBranches,
    importCSVProcess2,
    getsettings,
    truncateSA,
    importCSVProcess3,
 } = require("./allocation.service");


module.exports = {
    importCSVSales_controller: async (req, res) => {
        const data  = req.body;
        deleteProductOfftakes((err,results) => {
            if(err){
                console.log(err);
                return;
            }
        })
        importCSVSales(data,(err,results) => {
            if(err){
                console.log(err);
                return;
            }
            return res.json({
                success:1,
                data:results
            });
        });
    },
    importCSVStock_controller: async (req, res) => {
        const data  = req.body;
        deleteStockStatus((err,results) => {
            if(err){
                return res.json({
                    success:-1,
                    message:err,
                });
            }
        })
        importCSVStock(data,(err,results) => {
            if(err){
                return res.json({
                    success:-1,
                    message:err
                });
            }
            if(!results){
                return res.json({
                    success:0,
                    message:'Something went wrong'
                });
            }
            return res.json({
                success:1,
                data:results
            });
        });
    },
    ImportCSVProcess2_controller: async(req, res) => {
        var data;
        deleteInventory((err,results) => {
            if(err){
                console.log(err);
                return;
            }
        });
        fetchBranches((err,results) => {
            if(err){
                console.log(err)
                return;
            }
            if(!results){
                return "Something went wrong"
            }
            data = results
            importCSVProcess2(data,(err,results) => {
                if(err){
                    console.log(err);
                    return;
                }
                return res.json({
                    success:1,
                    data:results
                })
            })
        });
    },
    ImportCSVProcess3_controller:async(req,res) => {
        truncateSA((err,data) => {
            if(err){
                return res.json({
                    success:-1,
                    data:err
                })
            }
        }),
        getsettings((err,data) => {
            if(err){
                return res.json({
                    success:-1,
                    data:err
                })
            }
            if(!data){
                return res.json({
                    success:0,
                    data:'Something went wrong'
                });
            }
            importCSVProcess3(data,async(err,results) => {
                if(err){
                    console.log(err)
                    return;
                }
                if(!results){
                    return res.json({
                        success:0,
                        data:'Something went wrong'
                    });
                }
                return res.json({
                    success:1,
                    data:results
                })
            })
        });
    },
    updateInventory_controller:async (req,res) => {
        truncateInventory((err,results) => {
            if(err){
                console.log(err);
                return;
            }
        });
        getBranches((err,results) => {
            if(err){
                console.log(err);
                return;
            }
            if(!results){
                return res.json({
                    success:0,
                    message:"Something went wrong"
                });
            }
            return res.json({
                success:1,
                data:results,
            });
        });
    },
    getAllAllocations_controller: (req, res) => {
        getAllAllocations((err, results) =>{
            if(err){
                console.log(err);
                return;
            }   
            if(!results){
                return res.jason({
                    success: 0,
                    message: "error"
                });
            }
            return res.json({
                success: 1,
                data: results
            });
        })
    },
    getAllocationSummary_controller:(req,res) => {
        getAllocationSummary((err, results) => {
            if(err){
                return res.json({
                    success:-1,
                    message:err
                });
            }
            if(!results){
                return res.json({
                    success:0,
                    message:"Something went wrong",
                })
            }
            return res.json({
                success:1,
                data:results
            });
        })
    },
    getAllocation_controller: (req, res) => {
        const data = req.body
        getAllocation(data, (err, results) =>{
            if(err){
                console.log(err);
                return;
            }   
            if(!results){
                return res.jason({
                    success: 0,
                    message: "Branch not Found"
                });
            }
            return res.json({
                success: 1,
                data: results
            });
        })
    },
    addAllocation_controller : (req,res) => {
            const data = req.body
            addAllocation(data,(err, results) =>{
            if(err){
                console.log(err);
                return;
            }   
            if(!results){
                return res.jason({
                    success: 0,
                    message: "error"
                });
            }
            return res.json({
                success: 1,
                data: results
            });
        })
    },
    editAllocation_controller: (req, res) => {
        const data = req.body
        editAllocation(data, (err, results) =>{
            if(err){
                console.log(err);
                return;
            }   
            if(!results){
                return res.jason({
                    success: 0,
                    message: "error"
                });
            }
            return res.json({
                success: 1,
                data: results
            });
        })
    },
    deleteAllocation_controller: (req, res) => {
        const data = req.body
        deleteAllocation(data, (err, results) =>{
            if(err){
                console.log(err);
                return;
            }   
            if(!results){
                return res.jason({
                    success: 0,
                    message: "allocation not found"
                });
            }
            return res.json({
                success: 1,
                message: "Successfully Saved"
            });
        })
    },
    searchproduct_controller: (req, res) => {
        const data = req.body
        searchproduct(data, (err, results) =>{
            if(err){
                console.log(err);
                return;
            }   
            if(!results){
                return res.jason({
                    success: 0,
                    message: "allocation not Found"
                });
            }
            return res.json({
                success: 1,
                data: results
            });
        })
    },
    savefinalAllocation_controller: (req, res) =>{
        const data = req.body
        savefinalAllocation((err,results) =>{
            if(err){
                return res.json({
                    success:-1,
                    message:err
                });
            }
            if(!results){
                return res.json({
                    success: 0,
                    message: "Something went wrong in saving allocation"
                });
            }
            truncateAllocation((err,results) => {
                if(err){
                    console.log(err)
                    return;
                }
            })
            return res.json({
                success:1,
                data:results
            });
        });
    }
   
}
