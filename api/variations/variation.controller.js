const { 
    read_all_variation,
    read_one_variation,
    create_variation,
    update_variation,
    delete_variation
 } = require("./variation.service");

 module.exports = {
    readallvariation: (req, res) => {
        read_all_variation((err, results) =>{
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
    readonevariation: (req, res) => {
        const id = req.params.id;
        read_one_variation(id,(err, results) =>{
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
    createvariation: (req,res) => {
        const data = req.body
        create_variation(data, (err, results) => {
           
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
    updatevariation: (req,res) => {
        const data =  req.body;
        const id = req.params.id;   

        update_variation(data,id, (err, results) => {
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
    deletevariation: (req,res) => {
        const id = req.params.id;
        delete_variation(id, (err, results) => {
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