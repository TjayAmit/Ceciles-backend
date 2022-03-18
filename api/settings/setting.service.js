const pool = require("../../config/database");

module.exports = {
    //getsettings
    get_settings : (callBack) => {
        pool.query(
            `SELECT * FROM settings`,
            (error, results, fields) => {
                if(error){ 
                   return callBack(error);
                }
                
                return callBack(null, results);
            }
        );
    },
    //editsettings
    edit_settings : (data, callBack) => {
        pool.query(
            `UPDATE settings SET average_days = ${data.average_days}, inventory_goal = ${data.inventory_goal} WHERE Settings_ID=1;`,
            (error, results, fields) => {
                if(error){ 
                   return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },
}
