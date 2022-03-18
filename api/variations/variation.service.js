const pool = require("../../config/database");


module.exports = {
    /* read all */
    read_all_variation : (callBack) => {
        pool.query(`SELECT * FROM variations`,
             (error, results, fields) => {
                if(error){ 
                   return callBack(error);
                }
                return callBack(null, results);
            }
        )
    },
    /* read one */
    read_one_variation : (id, callBack) => {
        pool.query(`SELECT * FROM variations WHERE variations_id = ${id}`,
             (error, results, fields) => {
                if(error){ 
                   return callBack(error);
                }
                return callBack(null, results);
            }
        )
    },
    /* create */
    create_variation : (data,callBack) => {
        pool.query(`INSERT INTO variations(variation_label,variation_value) VALUES ("${data.variation_label}",${data.variation_value})`,
             (error, results, fields) => {
                if(error){ 
                   return callBack(error);
                }
                return callBack(null, results);
            }
        )   
    },
    /* update */
    update_variation : (data,id,callBack) => {
        pool.query(`UPDATE variations SET variation_label="${data.variation_label}", variation_value = ${data.variation_value} WHERE variation_id = ${id}`,
             (error, results, fields) => {
                if(error){ 
                   return callBack(error);
                }
                return callBack(null, results);
            }
        )  
    },
    /* delete */ 
    delete_variation : (id,callBack) => {
        pool.query(`DELETE FROM variations WHERE variation_id = ${id}`,
             (error, results, fields) => {
                if(error){ 
                   return callBack(error);
                }
                return callBack(null, results);
            }
        )  
    }
}