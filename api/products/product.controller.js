const { 
    read_all_product,
    read_one_product,
    create_product,
    update_product,
    delete_product,
    import_master_list,
    read_all_manufacturer
 } = require("./product.service");

 module.exports = {
    import_masterlist_controller:(req,res) => {
        const data  = req.body;
        import_master_list(data,(err,results) => {
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
            })
        });
    },
    readmanufacturer: (req,res) => {
        read_all_manufacturer((err,results) => {
            if(err){
                return res.json({
                    success:-1,
                    message:err
                });
            }
            if(!results) {
                return res.json({
                    success:0,
                    message:"something went wrong"
                });
            }
            return res.json({
                success:1,
                data:results
            });
        })
    },
    readallproduct: (req, res) => {
        read_all_product((err, results) =>{
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
    readoneproduct: (req, res) => {
        const id = req.params.id;
        read_one_product(id,(err, results) =>{
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
    createproduct: (req,res) => {
        const data = req.body
        create_product(data, (err, results) => {
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
    updateproduct: (req,res) => {
        const data =  req.body;
        update_product(data, (err, results) => {
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
    deleteproduct: (req,res) => {
        const id = req.params.id;
        delete_product(id, (err, results) => {
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