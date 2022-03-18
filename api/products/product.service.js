const pool = require("../../config/database");


module.exports = {
    /* read all */
    read_all_product : (callBack) => {
        pool.query(`SELECT * FROM products`,
             (error, results, fields) => {
                if(error){ 
                   return callBack(error);
                }
                return callBack(null, results);
            }
        )
    },
    /* read one */
    read_one_product : (id, callBack) => {
        pool.query(`SELECT * FROM products WHERE product_id = ${id}`,
             (error, results, fields) => {
                if(error){ 
                   return callBack(error);
                }
                return callBack(null, results);
            }
        )
    },
    /* create */
    create_product : (data,callBack) => {
        pool.query(`INSERT INTO products(product_name,uom,uom_value,principal_id,principal_name) VALUES ("${data.product_name}","${data.uom}",${data.uom_value},"${data.principal_id}","${data.principal_name}")`,
             (error, results, fields) => {
                if(error){ 
                   return callBack(error);
                }
                return callBack(null, results);
            }
        )   
    },
    /* update */
    update_product : (data,id,callBack) => {
        pool.query(`UPDATE products SET product_name="${data.product_name}", uom = "${data.uom}", uom_value = ${data.uom_value}, principal_id = "${data.principal_id}", principal_name = "${data.principal_name}" WHERE product_id = ${id}`,
             (error, results, fields) => {
                if(error){ 
                   return callBack(error);
                }
                return callBack(null, results);
            }
        )  
    },
    /* delete */ 
    delete_product : (id,callBack) => {
        pool.query(`DELETE FROM products WHERE product_id = ${id}`,
             (error, results, fields) => {
                if(error){ 
                   return callBack(error);
                }
                return callBack(null, results);
            }
        )  
    }
}