const {
    getHistory,
    getHistoryCondition,
    getHistoryCondition2,
    listdates
} = require("./history.service");

module.exports = {
    getHistory_controller:(req,res) => {
        getHistory((err,results) => {
            if(err){
                return res.json({
                    success:-1,
                    message:err
                });
            }
            if(!results){
                return res.json({
                    success:0,
                    message:'Something went wrong',
                });
            }
            return res.json({
                success:1,
                data:results
            });
        })
    },
    getHistoryCondition_controller:(req,res) => {
        const data = req.body;
        getHistoryCondition(data,(err,results) => {
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
    getHistoryCondition2_controller:(req,res) => {
        const data = req.body;
        getHistoryCondition2(data,(err,results) => {
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
    listdates_controller:async(req,res) => {
        listdates((err,results) => {
            if(err){
                return res.json({
                    success:-1,
                    message:err
                });
            }
            if(!results){
                return res.json({
                    success:0,
                    message:"Something went wrong"
                });
            }
            return res.json({
                success:1,
                data:results
            });
        })
    }
}
