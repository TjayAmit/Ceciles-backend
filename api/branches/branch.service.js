const pool = require("../../config/database");


module.exports = {
    /* read all */
    read_all_branch : (callBack) => {
        pool.query(`SELECT * FROM branches`,
             (error, results, fields) => {
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