const pool = require("../../config/database");

module.exports = {
    /* Overall sold quantity in every month for especific product_name */
    a_service : (data, callBack) => {
        pool.query(
            `SELECT SUM(sold_quantity) as quantity, DATE_FORMAT(sold_date, "%Y-%m-%d") as Date_Sold, product_name FROM product_offtakes GROUP BY sold_date`,
            [
                data.product_name,
            ],
            (error, results, fields) => {
                if(error){ 
                   return callBack(error);
                }
                
                return callBack(null, results);
            }
        );
    },
    /* Overall sold quantity in every product in especfic month */
    b_service : (data,callBack) =>{
        pool.query(

            'SELECT SUM(sold_quantity) as quantity, DATE_FORMAT(sold_date, "%Y-%M-%d") as Date_Sold, product_name FROM product_offtakes GROUP BY product_name LIMIT 20;',
            // SELECT SUM(sold_quantity) as quantity, DATE_FORMAT(sold_date, "%Y-%M-%d") as Date_Sold, product_name FROM product_offtakes WHERE sold_date LIKE "%?%" GROUP BY product_name;

            [
                data.sold_date,
            ],
            (error, results, fields) => {
                if(error){ 
                   return callBack(error);
                }
                return callBack(null, results);
            }
        )
    },
    /* Sold quantity for every branch in especific product_name and date */ 
      c_service : (data,callBack) =>{
        pool.query(
            // 'SELECT branch, sold_quantity, DATE_FORMAT(sold_date, "%Y-%M-%d") as Date_Sold FROM product_offtakes WHERE product_name LIKE "%?%" AND sold_date LIKE "%?%" ORDER BY sold_quantity DESC',
            'SELECT branch, sold_quantity, DATE_FORMAT(sold_date, "%Y-%M-%d") as Date_Sold FROM product_offtakes ORDER BY sold_quantity DESC limit 10',
            [
                data.product_name,
                data.sold_date,
            ],
            (error, results, fields) => {
                if(error){ 
                   return callBack(error);
                }
                return callBack(null, results);
            }
        )
    },
    /* most saleable product in the especific branch and especific date */
    d_service : (data, callBack) => {
           pool.query(
            // 'SELECT * FROM product_offtakes WHERE branch LIKE "%?%" AND sold_date LIKE "%?%" ORDER BY sold_quantity DESC',
            'SELECT * FROM product_offtakes ORDER BY sold_quantity DESC LIMIT 5',

            [
                data.branch,
                data.sold_date,
            ],
            (error, results, fields) => {
                if(error){ 
                   return callBack(error);
                }
                return callBack(null, results);
            }
        )
    },
    /* least saleable product in the especific branch and especific date */
    e_service : (data,callBack) => {
          pool.query(
            'SELECT * FROM `product_offtakes` WHERE branch = ? AND sold_date = ? ORDER BY sold_quantity ASC',
            [
                data.branch,
                data.sold_date,
            ],
            (error, results, fields) => {
                if(error){ 
                   return callBack(error);
                }
                return callBack(null, results);
            }
        )
    },
    /* average per day sold every medicine in specific branch*/
    f_service : (data , callBack) => {
        pool.query(
            // 'SELECT (sold_quantity / CAST(DAY(LAST_DAY(sold_date)) AS DECIMAL)) as average_quantity_sold , product_name, branch FROM product_offtakes WHERE sold_date LIKE "%?%" AND branch LIKE "%?%" ORDER BY average_quantity_sold DESC',
            'SELECT (sold_quantity / CAST(DAY(LAST_DAY(sold_date)) AS DECIMAL)) as average_quantity_sold , product_name, branch FROM product_offtakes ORDER BY average_quantity_sold DESC LIMIT 5',
            [
                data.sold_date,
                data.branch
            ],
            (error, results, fields) => {
                if(error){ 
                   return callBack(error);
                }
                return callBack(null, results);
            }
        )
    },
    listBranches : (callBack) => {
         pool.query(
            'SELECT DISTINCT branch FROM product_offtakes',
            (error, results, fields) => {
                if(error){ 
                   return callBack(error);
                }
                return callBack(null, results);
            }
        )
    },
    listWarehouses : (callBack) => {
         pool.query(
            'SELECT DISTINCT warehouse FROM stock_status',
            (error, results, fields) => {
                if(error){ 
                   return callBack(error);
                }
                return callBack(null, results);
            }
        )
    },
    listProducts : (callBack) => {
         pool.query(
            'SELECT DISTINCT product_id, product_name FROM stock_status',
            (error, results, fields) => {
                if(error){ 
                   return callBack(error);
                }
                return callBack(null, results);
            }
        )
    },
    listDates : (callBack) => {
        pool.query(
           'SELECT DISTINCT DATE_FORMAT(sold_date , "%M %Y") as month_year FROM `product_offtakes`',
           (error, results, fields) => {
               if(error){ 
                  return callBack(error);
               }
               return callBack(null, results);
           }
       )
   },
   searchproduct : (data, callBack) => {
        pool.query(
            `SELECT DISTINCT product_name FROM stock_status WHERE product_id LIKE "%${data.product_id}%" AND product_name LIKE "%${data.product_name}%"`
            ,(error, results, fields) => {
                if(error){ 
                   return callBack(error);
                }
                return callBack(null, results);
            } 
        )
     }
};