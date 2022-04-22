const { getMaxListeners } = require("../../config/database");
const { 
    getAllDistributions,
    getDistribution,
    getDistributionD,
    saveDistribution,
    editDistribution,
    deleteDistribution,
    searchproduct,
    generateDistribution,
    getDistributionAlloDate,
    getDistributionManufacturer,
    getDistributionSelect,
 } = require("./Distribution.service");


module.exports = {
    generateDistribution_controller:(req,res) => {
        const data = req.body;
        generateDistribution(data,(err,results) =>{
            if(err){
                res.json({
                    success:-1,
                    message:err
                });
            }
            if(!results){
                return res.json({
                    success:0,
                    message:'It seems there is no record for main warehouse',
                });
            }
            return res.json({
                success:1,
                data:'Generating Distribution Success'
            });
        });
    },
    getAllDistributions_controller: (req, res) => {
        getAllDistributions((err, results) =>{
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
    getDistribution_controller: (req, res) => {
        const data = req.body
        getDistribution(data, (err, results) =>{
            if(err){
                console.log(err);
                return;
            }   
            if(!results){
                return res.jason({
                    success: 0,
                    message: "User not Found"
                });
            }
            return res.json({
                success: 1,
                data: results
            });
        })
    },
    getDistributionAlloDate_controller: (req, res) => {
        const data = req.body
        getDistributionAlloDate(data, (err, results) =>{
            if(err){
                console.log(err);
                return res.json({
                    success:-1,
                    message:err
                });
            }   
            if(!results){
                return res.json({
                    success: 0,
                    message: "User not Found"
                });
            }
            return res.json({
                success: 1,
                data: results
            });
        })
    },
    getDistributionManufacturer_controller: (req, res) => {
        const data = req.body
        getDistributionManufacturer(data, (err, results) =>{
            if(err){
                return res.json({
                    success:-1,
                    message:err
                });
            }   
            if(!results){
                return res.json({
                    success: 0,
                    message: "User not Found"
                });
            }
            return res.json({
                success: 1,
                data: results
            });
        })
    },
    getDistributionSelect_controller: (req, res) => {
        getDistributionSelect((err, results) =>{
            if(err){
                console.log(err);
                return;
            }   
            if(!results){
                return res.jason({
                    success: 0,
                    message: "User not Found"
                });
            }
            return res.json({
                success: 1,
                data: results
            });
        })
    },
    getDistributionD_controller: (req, res) => {
        const data = req.body;
        getDistributionD(data, (err, results) =>{
            if(err){
                console.log(err);
                return;
            }   
            if(!results){
                return res.jason({
                    success: 0,
                    message: "Distribution Not Found"
                });
            }
            return res.json({
                success: 1,
                data: results
            });
        })
    },
    saveDistribution_controller : (req,res) => {
        const data = req.body;
            saveDistribution(data,async(err, results) =>{
            if(err){
                return res.json({
                    success:-1,
                    message:err
                });
            }   
            if(!results){
                return res.json({
                    success: 0,
                    message: "Something went wrong"
                });
            }
            return res.json({
                success: 1,
                data: results
            });
        })
    },
    editDistribution_controller: (req, res) => {
        const data = req.body
        editDistribution(data, (err, results) =>{
            if(err){
                return res.json({
                    success:-1,
                    message:err
                });
            }   
            if(!results){
                return res.json({
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
    deleteDistribution_controller: (req, res) => {
        const data = req.params.id
        deleteDistribution(data, (err, results) =>{
            if(err){
                return res.json({
                    success:-1,
                    message:err
                });
            }   
            if(!results){
                return res.json({
                    success: 0,
                    message: "Distribution not found"
                });
            }
            return res.json({
                success: 1,
                data: results
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
                    message: "Distribution not Found"
                });
            }
            return res.json({
                success: 1,
                data: results
            });
        })
    },
}
