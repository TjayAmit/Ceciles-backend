const pool = require("../../config/database");


module.exports = {
    view_inventory:(data,callBack) => {
        pool.query(`SELECT i.inventory_id,i.inventory_branch,DATE_FORMAT(i.inventory_date, "%Y-%m-%d") as inventory_date,i.product_id,i.product_name,i.quantity FROM inventories i JOIN branches s ON s.branch_name = i.inventory_branch WHERE i.inventory_branch = "${data.branch}"`,
        (error,results) => {
            if(error){
                return callBack(error);
            }
            return callBack(null,results);
        });
    },
    /* read all */
    read_all_branch : (callBack) => {
        pool.query(`SELECT * FROM branches`,
             (error, results) => {
                if(error){ 
                   return callBack(error);
                }
                return callBack(null, results);
            }
        )
    },
    /* read one */
    read_one_branch : (id, callBack) => {
        pool.query(`SELECT * FROM branches WHERE branch_id = ${id}`,
             (error, results, fields) => {
                if(error){ 
                   return callBack(error);
                }
                return callBack(null, results);
            }
        )
    },

    /* create branch_id,branch_name,In_Transit_WH_code,In_Transit_WH_Name,Warehouse_Code,Warehouse_Name	*/
    create_branch : (data,callBack) => {
        pool.query('INSERT INTO branches VALUES (?,?,?,?,?,?)',
        [data.branch_id,data.branch_name,data.In_Transit_WH_code,data.In_Transit_WH_Name,data.Warehouse_Code,data.Warehouse_Name],
             (error, results, fields) => {
                if(error){ 
                   return callBack(error);
                }
                return callBack(null, results);
            }
        )   
    },
    
    /* update */
    update_branch : (data,callBack) => {
        pool.query('UPDATE branches SET branch_name = ?,In_Transit_WH_code = ?,In_Transit_WH_Name = ?,Warehouse_Code = ?, Warehouse_Name = ? WHERE branch_id =?',
        [data.branch_name,data.In_Transit_WH_code,data.In_Transit_WH_Name,data.Warehouse_Code,data.Warehouse_Name,data.branch_id],
             (error, results, fields) => {
                if(error){ 
                   return callBack(error);
                }
                return callBack(null, results);
            }
        )  
    },

    /* delete */ 
    delete_branch : (id,callBack) => {
        pool.query('DELETE FROM branches WHERE branch_id = ?',[id],
             (error, results, fields) => {
                if(error){ 
                   return callBack(error);
                }
                return callBack(null, results);
            }
        )  
    }
}