const { off } = require("../../config/database");
const pool = require("../../config/database");

module.exports = {
    /* get Distribution specific branch*/
    generateDistribution:async(data,callBack) => {
        var sum_of_sa = "(SELECT SUM(suggested_allocation_quantity) FROM distributions WHERE product_id = dis.product_id GROUP BY product_id)";
        var sum_of_dis = "(SELECT SUM(distributed_quantity) FROM distributions WHERE product_id = dis.product_id GROUP BY product_id)";
        var main_inventory = "(SELECT i.quantity/p.uom_value FROM inventories i JOIN products p ON p.product_id = i.product_id WHERE i.product_id = dis.product_id AND i.inventory_branch='MAIN WAREHOUSE1')";
        pool.query(
            `   UPDATE distributions dis JOIN products p ON p.product_id=dis.product_id SET dis.distribution_quantity = CASE 
                WHEN ${sum_of_sa} < ${main_inventory} THEN  
                    CASE WHEN dis.distributed_quantity = 0 THEN dis.suggested_allocation_quantity 
                    ELSE dis.suggested_allocation_quantity - dis.distributed_quantity END
                WHEN dis.distributed_quantity > 0 AND ${sum_of_sa} - ${sum_of_dis} < ${main_inventory} THEN 
                    dis.suggested_allocation_quantity - dis.distributed_quantity
                ELSE ${main_inventory} * dis.percentage_quantity END
                WHERE dis.allocation_date = "${data.allocation_date}" AND p.principal_name = "${data.manufacturer}";
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
    getDistribution : (data, callBack) => {
         pool.query(
             `SELECT * FROM distributions d JOIN products p ON p.product_id = d.product_id WHERE d.branch = "${data.branch}" AND d.allocation_date="${data.allocation_date}" AND p.principal_name="${data.manufacturer}" `,
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
      getDistributionManufacturer : async(data, callBack) => {
           pool.query(
               `SELECT * FROM distributions d JOIN product p ON p.product_id = d.product_id WHERE d.branch = "${data.branchname}" AND d.allocation_date = "${data.allocation_date}" AND p.principal_name = "${data.manufacturer}"`,
              (error, results) => {
                  if(error){ 
                     return callBack(error);
                  }
                  return callBack(null, results);
              }
           )
       },
      getDistributionSelect : async( callBack) => {
           pool.query(
               `SELECT DISTINCT CONCAT(d.allocation_date," ",p.principal_name) as label from distributions d JOIN products p ON p.product_id = d.product_id GROUP by d.allocation_date`,
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
    saveDistribution : (data,callBack) => {
        var length = 0;
        var record = 0;
         pool.query(`SELECT * FROM distributions d JOIN products p ON p.product_id = d.product_id WHERE distribution_quantity > 0 AND d.allocation_date = "${data.allocation_date}" AND p.principal_name="${data.manufacturer}"`,
             (error, results) => {
                if(error){ 
                    console.log(error)
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
                            console.log(err)
                            return callBack(err)
                        }
                        record++;
                        if(length == record){
                            pool.query(`UPDATE distributions dis JOIN products p ON p.product_id = dis.product_id SET dis.distributed_quantity = CASE
                                WHEN dis.distributed_quantity = 0 THEN dis.distribution_quantity
                                ELSE dis.distributed_quantity + dis.distribution_quantity END WHERE dis.allocation_date="${data.allocation_date}" 
                                AND p.principal_name = "${data.manufacturer}"
                                `,
                            (err1,results) => {
                                if(err1){
                                    console.log(err1)
                                    return callBack(err1)
                                }
                                pool.query(`UPDATE distributions d JOIN products p ON p.product_id = d.product_id SET distribution_quantity = 0 WHERE d.allocation_date="${data.allocation_date}" AND p.principal_name = "${data.manufacturer}"`,
                                    (err,results) => {
                                        if(err){
                                            console.log(err)
                                            return callBack(err)
                                        }
                                        pool.query(`DELETE d FROM distributions d JOIN products p ON d.product_id = p.product_id WHERE d.distributed_quantity = d.suggested_allocation_quantity AND d.allocation_date = "${data.allocation_date}" AND p.principal_name = "${data.manufacturer}"`,(err,res) => {
                                            if(err){
                                                console.log(err);
                                                return callBack(err);
                                            }
                                        })
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
     deleteDistribution : (id, callBack) => {
        pool.query("DELETE FROM distributions WHERE distribution_id=?",
            [id]
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
} 