const { 
    read_all_modifier,
    read_one_modifier,
    create_modifier,
    update_modifier,
    delete_modifier
 } = require("./modifier.service");

 module.exports = {
    readallmodifier: (req, res) => {
        read_all_modifier((err, results) =>{
            if(err){
                return res.json({
                    success:-1,
                    message:err
                });
            }   
            if(!results){
                return res.jason({
                    success: 0,
                    message: "Something went wrong."
                });
            }
            return res.json({
                success: 1,
                data: results
            });
        })
    },
    readonemodifier: (req, res) => {
        const id = req.params.id;
        read_one_modifier(id,(err, results) =>{
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
    createmodifier: (req,res) => {
        const data = req.body
        create_modifier(data, (err, results) => {
            if(err){
                console.log(err)
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
    updatemodifier: (req,res) => {
        const data =  req.body;
        const id = req.params.id;   

        update_modifier(data,id, (err, results) => {
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
    deletemodifier: (req,res) => {
        const id = req.params.id;
        delete_modifier(id, (err, results) => {
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
    }
 }