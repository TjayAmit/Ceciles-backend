const { 
    get_settings,
    edit_settings
 } = require("./setting.service");

 
module.exports = {
    getsetting: (req, res) => {
        get_settings((err, results) =>{
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
    editsetting: (req, res) => {
        const data = req.body
        edit_settings(data, (err, results) =>{
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
}