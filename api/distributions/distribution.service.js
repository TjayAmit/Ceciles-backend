const { off } = require("../../config/database");
const pool = require("../../config/database");

module.exports = {
    /* get Distribution specific branch*/
    generateDistribution:async(callBack) => {
        pool.query(
            `UPDATE distributions dis SET dis.distribution_quantity = 
                (SELECT inv.quantity/pro.uom_value FROM inventories inv JOIN products pro 
                ON pro.product_id = inv.product_id WHERE inv.product_id = dis.product_id AND 
                inv.inventory_branch = 'MAIN WAREHOUSE1') * dis.percentage_quantity;
            `,
            (error, results,fields) => {
                if(error){
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
        var length = 1;
        var record = 0;
         pool.query(`SELECT * FROM distributions WHERE distribution_quantity > 0`,
             (error, results) => {
                if(error){ 
                   return callBack(error);
                }
                var arr = results;
                length = results.length;
                for(var i = 0;i<arr.length; i++ ){
                    pool.query(`INSERT INTO distribution_history(branch,product_id,suggested_allocation_quantity,distribution_quantity,percentage_quantity,allocation_date) SELECT d.branch,d.product_id,d.suggested_allocation_quantity,d.distribution_quantity,d.percentage_quantity,d.allocation_date FROM distributions d WHERE d.distribution_id='${arr[i].distribution_id}'`,
                    (err,reulst)=>{
                        if(err){
                            callBack(err)
                        }
                        record++;
                        pool.query(`UPDATE distributions SET distributed_quantity = distribution_quantity`);
                        if(length == record){
                            pool.query(`UPDATE distributions SET distribution_quantity = 0`,
                                (err,results) => {
                                    if(err){
                                        callBack(err)
                                    }
                                    callBack(null,'Distribution Successfully Save')
                                }
                            )
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
        pool.query(
            `DELETE FROM distributions WHERE distribution_id= ${data.distribution_id}`
            ,(error, results, fields) => {
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