const { 
    a_service,
    b_service,
    c_service,
    d_service,
    e_service,
    f_service,
    listBranches,
    listWarehouses,
    listDates,
    searchproduct
 } = require("./model.service");

 
module.exports = {
    a_controller: (req, res) => {
        const data = req.body
        a_service(data, (err, results) =>{
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
   b_controller: (req, res) => {
        const data = req.body
        b_service(data, (err, results) =>{
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
    c_controller: (req, res) => {
        const data = req.body
        c_service(data, (err, results) =>{
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
    d_controller: (req, res) => {
        const data = req.body
        d_service(data, (err, results) =>{
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
    e_controller: (req, res) => {
        const data = req.body
        e_service(data, (err, results) =>{
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
    f_controller: (req, res) => {
        const data = req.body
        f_service(data, (err, results) =>{
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
    lb_controller: (req, res) => {
        listBranches((err, results) =>{
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
    lw_controller: (req, res) => {
        listWarehouses((err, results) =>{
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
    ld_controller: (req, res) => {
        listDates((err, results) =>{
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
    sp_controller: (req, res) => {
        const data = req.body;
        searchproduct(data, (err, results) =>{
            if(err){
                console.log(err);
                return;
            }   
            if(!results){
                return res.jason({
                    success: 0,
                    message: "product not Found"
                });
            }
            return res.json({
                success: 1,
                data: results
            });
        })

    }
}
