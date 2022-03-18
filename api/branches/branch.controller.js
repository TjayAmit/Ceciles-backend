const { 
    read_all_branch,
    read_one_branch,
    create_branch,
    update_branch,
    delete_branch
 } = require("./branch.service");

 module.exports = {
    readallbranch: (req, res) => {
        read_all_branch((err, results) =>{
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
    readonebranch: (req, res) => {
        const id = req.params.id;
        read_one_branch(id,(err, results) =>{
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
    createbranch: (req,res) => {
        const data = req.body
        create_branch(data, (err, results) => {
           
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
    updatebranch: (req,res) => {
        const data =  req.body;

        update_branch(data, (err, results) => {
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
    deletebranch: (req,res) => {
        const id = req.params.id;
        delete_branch(id, (err, results) => {
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
    }
 }