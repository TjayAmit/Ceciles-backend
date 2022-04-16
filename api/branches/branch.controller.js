const { 
    read_all_branch,
    read_one_branch,
    create_branch,
    update_branch,
    delete_branch,
    view_inventory,
    read_all_branch2
 } = require("./branch.service");

 module.exports = {
    view_inventory_controller:(req,res) => {
        const data = req.body;
        view_inventory(data,(err,results) => {
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
                });
            }
            return res.json({
                success:1,
                data:results
            });
        });
    },
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
    readallbranch2: (req, res) => {
        read_all_branch2((err, results) =>{
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