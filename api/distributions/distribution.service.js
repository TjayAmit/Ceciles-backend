const { off } = require("../../config/database");
const pool = require("../../config/database");

module.exports = {
    /* get Distribution specific branch*/
    generateDistribution:async(callBack) => {
        var sum_of_sa = "(SELECT SUM(suggested_allocation_quantity) FROM distributions WHERE product_id = dis.product_id GROUP BY product_id)";
        var sum_of_dis = "(SELECT SUM(distributed_quantity) FROM distributions WHERE product_id = dis.product_id GROUP BY product_id)";
        var main_inventory = "(SELECT i.quantity/p.uom_value FROM inventories i JOIN products p ON p.product_id = i.product_id WHERE i.product_id = dis.product_id AND i.inventory_branch='MAIN WAREHOUSE1')";
        pool.query(
            `   UPDATE distributions dis SET dis.distribution_quantity = CASE 
                WHEN ${sum_of_sa} < ${main_inventory} THEN  
                    CASE WHEN dis.distributed_quantity = 0 THEN dis.suggested_allocation_quantity 
                    ELSE dis.suggested_allocation_quantity - dis.distributed_quantity END
                WHEN dis.distributed_quantity > 0 AND ${sum_of_sa} - ${sum_of_dis} < ${main_inventory} THEN 
                    dis.suggested_allocation_quantity - dis.distributed_quantity
                ELSE ${main_inventory} * dis.percentage_quantity END;
            `,
            (error, results) => {
                if(error){
                    console.log(error)
                    return callBack(error);
                }
                return callBack(null,results);
            }
        );
    },
    /* get Distribution specific branch*/
    savedistribution:async(callBack) => {
        pool.query(
            `INSERT INTO distribution_history(branch,product_id,suggested_allocation_quantity,
             distribution_quantity,percentage_quantity,allocation_date) values(
                dis.branch,dis.product_id,dis.suggested_allocation_quantity,dis.distribution_quantity,
                dis.percentage_quantity,dis.allocation_date
             ) 
            (SELECT * FROM distributions dis WHERE distributions_quantity IS NOT 0);
            `,
            (error, results,fields) => {
                if(error){
                    return callBack(error);
                }
                return callBack(null,results);
            }
        );
    },
    getDistribution : (data, callBack) => {
         pool.query(
             `SELECT * FROM distributions WHERE branch = "${data.branch}" `,
            (error, results, fields) => {
                if(error){ 
                   return callBack(error);
                }
                return callBack(null, results);
            }
         )
     },
     getDistributionAlloDate : async(data, callBack) => {
          pool.query(
              `SELECT * FROM distributions WHERE branch = "${data.branchname}" AND allocation_date = "${data.allocation_date}"`,
             (error, results) => {
                 if(error){ 
                    return callBack(error);
                 }
                 return callBack(null, results);
             }
          )
      },
     getDistributionD : (data, callBack) => {
        //Display Distribution data
        pool.query(
            `SELECT * FROM distributions WHERE allocation_date=?`,[data.allocation_date],
           (error, results, fields) => {
               if(error){ 
                   console.log(error);
                  return callBack(error);
               }
               return callBack(null, results);
           }
        )
    },
     /* get all Distributions */
    getAllDistributions : (callBack) => {
        pool.query(
             `SELECT * FROM distributions`,
             (error, results, fields) => {
                if(error){ 
                   return callBack(error);
                }
                return callBack(null, results);
            }
        )
    },
     /* add Distribution */
    saveDistribution : (callBack) => {
        var length = 0;
        var record = 0;
         pool.query(`SELECT * FROM distributions WHERE distribution_quantity > 0`,
             (error, results) => {
                if(error){ 
                   return callBack(error);
                }
                if(results.length == 0){
                    return callBack(error);
                }
                var arr = results;
                length = results.length;
                for(var i = 0;i<arr.length; i++ ){
                    pool.query(`INSERT INTO distribution_history(branch,product_id,suggested_allocation_quantity,distribution_quantity,percentage_quantity,allocation_date) SELECT d.branch,d.product_id,d.suggested_allocation_quantity,d.distribution_quantity,d.percentage_quantity,d.allocation_date FROM distributions d WHERE d.distribution_id='${arr[i].distribution_id}'`,
                    (err,reulst)=>{
                        if(err){
                            return callBack(err)
                        }
                        record++;
                        if(length == record){
                            pool.query(`UPDATE distributions SET distributed_quantity = CASE
                                WHEN distributed_quantity = 0 THEN distribution_quantity
                                ELSE distributed_quantity + distribution_quantity END`,
                            (err,results) => {
                                if(err){
                                    return callBack(err)
                                }
                                pool.query(`UPDATE distributions SET distribution_quantity = 0`,
                                    (err,results) => {
                                        if(err){
                                            return callBack(err)
                                        }
                                        pool.query(`DELETE FROM distributions WHERE distributed_quantity = suggested_allocation_quantity`)
                                        callBack(null,'Distribution Successfully Save')
                                    }
                                )
                            });
                        }
                    });
                }
            }
         )
     },
     /* edit Distribution */
     editDistribution : (data , callBack) => {
         pool.query(
             `UPDATE distributions set distribution_quantity= ${data.distribution_quantity} WHERE distribution_id = ${data.distribution_id}"`
             ,(error, results, fields) => {
                if(error){ 
                   return callBack(error);
                }
                return callBack(null, results);
            }
         )
     },
     /* delete Distribution */
     deleteDistribution : (data, callBack) => {
         console.log(data.distribution_id)
        pool.query("DELETE FROM distributions WHERE distribution_id=?",
            [data.distribution_id]
            ,(error, results) => {
                if(error){ 
                   return callBack(error);
                }
                return callBack(null, results);
            } 
        )
     },
    /*Search By Product id or product name*/
    searchproduct : (data, callBack) => {
        pool.query(
            `SELECT * FROM distributions WHERE product_id LIKE "%${data.product_id}%" AND product_name LIKE "%${data.product_name}%"`
            ,(error, results, fields) => {
                if(error){ 
                   return callBack(error);
                }
                return callBack(null, results);
            } 
        )
     },
    listdates : async( callBack) => {
        pool.query(
            `SELECT DISTINCT DATE_FORMAT(allocation_date, "%Y-%m-%d") as allo_date FROM distributions ORDER BY allocation_date DESC`
            ,(error, results, fields) => {
                if(error){ 
                   return callBack(error);
                }
                return callBack(null, results);
            } 
        )
    }
} 