const pool = require("../../config/database");


module.exports = {
    /* read all */
    read_all_variation : (callBack) => {
        pool.query(`SELECT * FROM variations`,
             (error, results) => {
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
        data.value /= 100
        pool.query(`INSERT INTO variations(variation_label,variation_value) VALUES ("${data.label}",${data.value})`,
             (error, results) => {
                if(error){ 
                   return callBack(error);
                }
                return callBack(null, results);
            }
        )   
    },
    /* update */
    update_variation : (data,id,callBack) => {
        pool.query(`UPDATE variations SET variation_label="${data.label}", variation_value = ${data.value} WHERE variation_id = ${id}`,
             (error, results) => {
                if(error){ 
                    console.log(error)
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