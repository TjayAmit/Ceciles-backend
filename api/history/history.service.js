const res = require("express/lib/response");
const pool = require("../../config/database");
const { off } = require("../../config/database");

module.exports = {
    getHistory:(callBack) => {
        pool.query(`SELECT d.history_id,d.branch,d.product_id,product_name,d.suggested_allocation_quantity,d.distribution_quantity,d.percentage_quantity,
            DATE_FORMAT(d.allocation_date, "%Y-%m-%d") as allo_date,DATE_FORMAT(distribution_date, "%Y-%m-%d")
            as dis_date FROM distribution_history d JOIN products ON product_id=d.product_id`,
            (err,results) => {
                console.log(results)
              if(err){
                  callBack(err)
              }  
              return callBack(null,results)
            })
    },
    getHistoryCondition:(data,callBack) => {
        pool.query(`SELECT d.history_id,d.branch,d.product_id,p.product_name,d.suggested_allocation_quantity,d.distribution_quantity,d.percentage_quantity,
        DATE_FORMAT(d.allocation_date, "%Y-%m-%d") as allo_date,DATE_FORMAT(d.distribution_date, "%Y-%m-%d")
        as dis_date FROM distribution_history d JOIN products p ON p.product_id=d.product_id WHERE d.allocation_date="${data.allocation_date}"`,
            (err,results) => {
                if(err){
                    callBack(err)
                }
                return callBack(null,results)
            })
    },
    getHistoryCondition2:(data,callBack) => {
        console.log(data.allocation_date + ' ' + data.distribution_date)
        pool.query(`SELECT d.history_id,d.branch,d.product_id,p.product_name,d.suggested_allocation_quantity,d.distribution_quantity,d.percentage_quantity,
        DATE_FORMAT(d.allocation_date, "%Y-%m-%d") as allo_date,DATE_FORMAT(d.distribution_date, "%Y-%m-%d")
        as dis_date FROM distribution_history d JOIN products p ON p.product_id=d.product_id  WHERE d.allocation_date="${data.allocation_date}" AND distribution_date = "${data.distribution_date}"`,
            (err,results) => {
                if(err){
                    callBack(err)
                }
                return callBack(null,results)
            });
    },
    listdates:async( callBack) => {
        pool.query(
            `SELECT DISTINCT DATE_FORMAT(allocation_date, "%Y-%m-%d") AS allo_date,DATE_FORMAT(allocation_date, "%Y-%m-%d") AS dis_date FROM distribution_history 
            ORDER BY allocation_date DESC`
            ,(error, results, fields) => {
                if(error){ 
                   return callBack(error);
                }
                return callBack(null, results);
            } 
        )
    }
}