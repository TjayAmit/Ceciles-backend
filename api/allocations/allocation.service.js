const res = require("express/lib/response");
const pool = require("../../config/database");
const csvtojson = require('csvtojson/v2');
const { off } = require("../../config/database");

module.exports = {
    /* get allocation specific branch*/
    getAllocation : (data, callBack) => {
        pool.query(
            `SELECT s.suggested_id,s.branch,s.product_id,p.product_name,p.uom,p.uom_value,s.available_inventory,
            s.sold_quantity,s.suggested_allocation_quantity,s.updated_allocation_quantity,s.percentage_quantity FROM suggested_order s JOIN
            products p ON p.product_id = s.product_id WHERE s.branch = "${data.branch}" ORDER BY s.suggested_allocation_quantity DESC`,
            (error, results) => {
                if(error){ 
                   return callBack(error);
                }
                return callBack(null, results);
            }
        )
    },
    //get Summary of Allocation
    getAllocationSummary:(callBack) => {
        pool.query(
            `SELECT s.product_id,p.product_name,p.uom,p.uom_value,SUM((CASE WHEN updated_allocation_quantity = 0 THEN suggested_allocation_quantity ELSE updated_allocation_quantity END)) as total,
                ((SUM((CASE WHEN updated_allocation_quantity = 0 THEN suggested_allocation_quantity ELSE updated_allocation_quantity END)) * p.uom_value) * p.product_price) as price FROM suggested_order s JOIN products p ON 
                p.product_id = s.product_id  GROUP BY s.product_id ASC`,
            (error, results, fieds) =>{
                if(error){
                    return callBack(error);
                }
                return callBack(null,results);
            }
        )
    },
    //get Summary of Allocation
    getAllocationSummaryWzero:(callBack) => {
        pool.query(
            `SELECT s.product_id,p.product_name,p.uom,p.uom_value,SUM((CASE WHEN updated_allocation_quantity = 0 THEN suggested_allocation_quantity ELSE updated_allocation_quantity END)) as total,
                ((SUM((CASE WHEN updated_allocation_quantity = 0 THEN suggested_allocation_quantity ELSE updated_allocation_quantity END)) * p.uom_value) * p.product_price) as price FROM suggested_order s JOIN products p ON 
                p.product_id = s.product_id  GROUP BY s.product_id ASC HAVING SUM((CASE WHEN updated_allocation_quantity = 0 THEN suggested_allocation_quantity ELSE updated_allocation_quantity END)) > 0`,
            (error, results, fieds) =>{
                if(error){
                    return callBack(error);
                }
                return callBack(null,results);
            }
        )
    },
     /* get all allocations */
    getAllAllocations : (callBack) => {
         pool.query(
            `SELECT * FROM suggested_order`,
             (error, results, fields) => {  
                if(error){ 
                   return callBack(error);
                }
                return callBack(null, results);
            }
        )
    },

    /* add allocation */
    addAllocation : (data ,callBack) => {
        pool.query(
            `INSERT INTO suggested_order(branch, product_id, uom, uom_value, available_inventory, sold_quantity, suggested_allocation_quantity, percentage_quantity) VALUES ("${data.branch}","${data.product_id}", "${data.product_name}", "${data.uom}", ${data.uom_value}, 0, 0, ${data.suggested_allocation_quantity},0 )`,
             (error, results, fields) => {
                    pool.query(`TRUNCATE total_suggestions`, function(err, results){
                        if (err){ 
                            throw err;
                        }
                        pool.query(`SELECT product_id, product_name, sum(suggested_allocation_quantity) as total FROM suggested_order GROUP BY product_id`, 
                         (err, results) => {
                            if (err){ 
                                return callBack(err);
                            }
                            var datatotal = results
                            for(var i = 0; i < datatotal.length; i++){
                                sap(datatotal[i].product_id,datatotal[i].total_suggested, function(result2,ts) {
                                    datasap =  result2;
                                                                
                                    for(var j = 0; j < datasap.length; j++){
                                        if(ts === 0){
                                            continue;
                                        }
                                        pool.query(`UPDATE suggested_order SET percentage_quantity = ${datasap[j].suggested_allocation_quantity/ts} WHERE suggested_id = ${datasap[j].suggested_id}`, function(err, results){
                                            if (err){ 
                                                throw err;
                                            }
                                        })  
                                    }
                                });
                            }
                        }) 
                    });
            if(error){ 
                return callBack(error);
            }
            return callBack(null, results);
            }
         )
     },
     deleteProductOfftakes: (callBack) => {
        //Empty Stock Status Table
        pool.query( `DELETE FROM product_offtakes`, (err, results, fields) => {
            if (err) {
                return callBack(err)
            }
            return callBack(null,results);
        }); 
     },
     importCSVSales:async (data, callBack) => {
        const {filename,months} = data;
        const mynames = filename.split(' ');
        const dates = mynames[2].split('-');
        const year = dates[2].split('.');
        let y = 2000 + parseInt(year[0]);
        let salereportdate = new Date(y,dates[0],dates[1]);
        if(filename.includes("Sales") || filename.includes("sales")){
            await csvtojson().fromFile(`./csv/${filename}`).then(source => {
                console.log(source.length)
                var length = 0;
                if (source.length === 0){
                  return callBack(null,"File is empty");
                }
    
                for (var i = 0; i < source.length; i++) {
                    var branch = source[i]["Branch"],
                        product_id = source[i]["Product ID"],
                        principal_id = source[i]["Principal ID"],
                        product_name = source[i]["Product"],
                        sold_quantity = source[i]["Qty"]
                        
                    var insertStatement = `INSERT INTO product_offtakes(branch,product_id,principal_id,	product_name,sold_quantity,sold_date) values(?,?,?,?,?,?)`;
                    var items = [branch,product_id,principal_id,product_name,sold_quantity,salereportdate];
                    
    
                    // Inserting data of current row
                    // into database
                    pool.query(insertStatement, items, (err, results) => {
                        if (err) {
                            return callBack(`Please check the file before importing`)
                        }
                        length++;
                        if(length == source.length){
                            pool.query(`SELECT * FROM pomodifier WHERE purchase_order_date = CURRENT_DATE()`,(errx,resultsx) => {
                                if(errx){
                                    return callBack(errx)
                                }
                                if(resultsx.length > 0){
                                    pool.query(`UPDATE pomodifier SET average_days = (${months}) WHERE pomodifier_id = ${resultsx[0]["pomodifier_id"]}`);
                                }else{
                                    pool.query(`INSERT INTO pomodifier(average_days) VALUES (${months})`);
                                }
                            })
                            
                            return callBack(null,'Sales Report Imported Successfully')
                        }
                    });
                }
            });
        }else{
            return callBack("File is not a sales Report");
        }
    },
    getBranches:(callBack) => {
        pool.query(`SELECT * FROM branches`,(err, results) => {
            if(err){
                return callBack(err)
            }
            return callBack(null,results);
        });
    },
    deleteStockStatus: (callBack) => {
       //Empty Stock Status Table
       pool.query( `DELETE FROM stock_status`, (err, results) => {
           if (err) {
               return callBack(err);
           }
           return callBack(null,results);
       }); 
    },
    importCSVStock:async (data, callBack) => {
       const {filename,months,isupdate_inventory} = data;
       if(filename.includes("Stock") || filename.includes("stock")){
            await csvtojson().fromFile(`./csv/${filename}`).then(source => {
                var length = 0;
                if (source.length === 0){
                return res.status(500).json({ msg : "no data in the csv"});
                }
    
                for (var i = 0; i < source.length; i++) {
                    var product_id = source[i]["Product ID"],
                        product_name = source[i]["Name"],
                        warehouse = source[i]["Warehouse"],
                        stock_remaining = source[i]["Remaining"]
                        unit = source[i]["Unit"]
        
                    if(stock_remaining < 0 ) {
                        stock_remaining = 0;
                    }
        
                    var query = `INSERT INTO stock_status SELECT "${product_id}","${product_name}","${stock_remaining}","${warehouse}","${unit}" 
                        FROM branches b WHERE b.Warehouse_Name="${warehouse}" OR b.In_Transit_WH_Name="${warehouse}"`;
            
                    pool.query(query, (err, results) => {
                        if (err) {
                            console.log(err)
                            return callBack(err)
                        } 
                        length++;
                        if(length == source.length){
                            if(isupdate_inventory == true){
                                pool.query(`SELECT * FROM pomodifier WHERE purchase_order_date = CURRENT_DATE()`,(errx,resultsx) => {
                                    if(errx){
                                        console.log(errx)
                                        return callBack(errx)
                                    }
                                    if(resultsx.length > 0){
                                        pool.query(`UPDATE pomodifier SET inventory_goal = (${months}) WHERE pomodifier_id = ${resultsx[0]["pomodifier_id"]}`);
                                    }else{
                                        pool.query(`INSERT INTO pomodifier(inventory_goal) VALUES (${months})`);
                                    }
                                })
                            }
                            return callBack(null,'Stock Status Imported Successfully')
                        }
                    })
                }
            })
            .catch(function (error) {
            console.log(error);
            });
       }else{
           return callBack("File is not stock status");
       }
    },
    deleteInventory:(callBack) => {
        pool.query(`DELETE FROM inventories`, (err, results) => {
            if(err){
                return callBack(err);
            }
            return callBack(null,results);
        });
    },
    getStockStatusRowCount:(callBack) => {
        pool.query(`SELECT COUNT(*) FROM stock_status`,
            (error,results,fields) => {
                if(error){
                    console.log(error)
                    return;
                }
                return callBack(null,results)
            }
        );
    },
    fetchBranches:(callBack) => {
        pool.query(`SELECT * FROM branches`,(error,results) => {
            if(error){
                console.log(error)
                return;
            }
            return callBack(null,results)
        })
    },
    importCSVProcess2:(data,callBack) => {
        var length = 0;
        for(var i = 0;i < data.length; i++){
            pool.query(`INSERT INTO inventories(inventory_branch,product_id,product_name,quantity) 
                SELECT "${data[i].branch_name}", product_id, product_name , SUM(stock_remaining) 
                FROM stock_status WHERE warehouse IN ("${data[i].In_Transit_WH_Name}" ,"${data[i].Warehouse_Name}") 
                AND product_name IN (SELECT DISTINCT product_name FROM stock_status) GROUP by product_name`,
            (error,results) => { 
                if(error){
                    console.log(error)
                    return;
                }
                length++;
                if(data.length == length){
                    return callBack(null,results);
                }
            });
        }
    },
    // END OF PROCESS 2 
    getsettings:(callback) => {
        var sql = `SELECT * FROM pomodifier WHERE purchase_order_date=CURRENT_DATE()`;
        pool.query(sql, function(err, results){
                if (err){ 
                    return callback(err);
                }
                return callback(null,results);
        })
    },
    getmodifiers(callback){
          var sql = "SELECT * FROM modifiers JOIN variations on modifiers.fk_variation_id = variations.variation_id";
          pool.query(sql, function(err, results){
                if (err){ 
                  throw err;
                }
                return callback(results);
         })
    },
    truncateSA:(callBack) => {
        pool.query('TRUNCATE suggested_order',
            (err,results)=>{
                if(err){
                    callBack(err)
                }
                return callBack(null,results)
        })
    },
    importCSVProcess3:(data,callBack) => {
        inventory_goal = data[0].inventory_goal
        average_days = data[0].average_days
        var datarecord = 0;
        var datalength = 1;

        pool.query(`INSERT INTO suggested_order (branch,product_id,available_inventory,sold_quantity,suggested_allocation_quantity) 
            SELECT i.inventory_branch, p.product_id, i.quantity, po.sold_quantity,
            suo(i.quantity,po.sold_quantity,${inventory_goal},p.uom_value,${average_days}) suggested_order FROM inventories i JOIN 
            products p on i.product_id = p.product_id JOIN product_offtakes po on i.inventory_branch = po.branch AND 
            i.product_id = po.product_id AND i.inventory_date = po.upload_date`, 
            (err, results)=>{
                if (err){ 
                    return callBack(err);
                }
                pool.query("SELECT * FROM modifiers JOIN variations on modifiers.fk_variation_id = variations.variation_id"
                    ,(err,result3) => {
                    if(err){
                        return callBack(err)
                    }
                    datamodifiers = result3

                    var datarecord2 = 0;
                    var datalength2 = 0;

                    var date_ob = new Date();
                    datalength2 = datamodifiers.length;

                    if(datalength2 > 0){
                        for(var i = 0; i < datamodifiers.length; i++){
                        var startdate = new Date(datamodifiers[i].date_from);
                        var enddate = new Date(datamodifiers[i].date_to);
                        var product = datamodifiers[i].product;
                        var branch = datamodifiers[i].branch;
                        var modi = datamodifiers[i].variation_id;
                        var manufacturer = datamodifiers[i].principal;
                        var query = `UPDATE suggested_order s JOIN variations v ON v.variation_id = ${modi} `;
                    
                        if(date_ob >= startdate  || date_ob <= enddate ){
                            if(manufacturer != "ALL" || branch != "ALL" || product != "ALL" ){
                              if(manufacturer != "ALL" && product != "ALL"){
                                 //with manufacturer name and product id
                                 query += ` JOIN products p ON s.product_id = p.product_id AND p.principal_id="${manufacturer}" `;
                              }
                              if(manufacturer == "ALL" && product != "ALL"){
                                 //with product id
                                 query += ` JOIN products p ON s.product_id = p.product_id `;
                              }
                              if(manufacturer != "ALL" && product == "ALL"){
                                 //with manufacturer id
                                 query += ` JOIN products p ON s.product_id = p.product_id AND  `;
                              }
                              if(branch != "ALL" && product != "ALL"){
                                 //with branch id and product id
                                 query += ` JOIN branches b ON s.branch = b.branch_name`;
                                 query += ` SET s.suggested_allocation_quantity = s.suggested_allocation_quantity + (s.suggested_allocation_quantity * v.variation_value)`;
                                 query += ` WHERE s.branch = "${branch}" AND s.product_id="${product}"`;
                              }
                              else if(branch != "ALL" && product == "ALL"){
                                 //width branch only
                                 query += ` JOIN branches b ON s.branch = b.branch_name`;
                                 query += ` SET s.suggested_allocation_quantity = s.suggested_allocation_quantity + (s.suggested_allocation_quantity * v.variation_value)`;
                                 query += ` WHERE s.branch = "${branch}"`;
                              }
                              else if(branch == "ALL" && product != "ALL"){
                                 //with product id and ALL branches
                                 query += ` SET s.suggested_allocation_quantity =  s.suggested_allocation_quantity + (s.suggested_allocation_quantity * v.variation_value)`;
                                 query += ` WHERE s.product_id = "${product}"`;
                              }
                              else{
                                 query += ` SET s.suggested_allocation_quantity =  s.suggested_allocation_quantity + (s.suggested_allocation_quantity * v.variation_value)`;
                              }
                            }
                            else{
                               query += ` SET s.suggested_allocation_quantity = s.suggested_allocation_quantity + (s.suggested_allocation_quantity * v.variation_value)`;
                            }
                            pool.query(query,
                               (error,results2) => {
                                 if(error){
                                   return callBack(error);
                                 }
                                 datarecord2++;
                                 if(datarecord2 == datalength2){
                                     pool.query(`SELECT product_id, sum(suggested_allocation_quantity) AS total_sa FROM suggested_order GROUP BY product_id `, 
                                         (err, results) =>{
                                             if (err){ 
                                                 console.log(err)
                                             }
                                             data = results;
                                             datalength = results.length;
                                             for(var i = 0; i < data.length; i++){
                                                 if(data[i].total_sa == 0){
                                                     datarecord++;
                                                     continue;
                                                 }
                                                 pool.query(`UPDATE suggested_order s SET percentage_quantity = s.suggested_allocation_quantity/"${data[i].total_sa}" WHERE s.product_id = "${data[i].product_id}"`,
                                                     (err,results) => {
                                                     if(err){
                                                         return callBack(err)
                                                     }
                                                     datarecord++;
                                                     if(datarecord == datalength){
                                                         return callBack(null,'Success in importing SA')
                                                     }
                                                 });
                                         }   
                                     })
                                  }
                            });           
                            
                        }
                        }
                    }else{
                        pool.query(`SELECT product_id, sum(suggested_allocation_quantity) AS total_sa FROM suggested_order GROUP BY product_id `, 
                            (err, results) =>{
                                if (err){ 
                                    console.log(err)
                                }
                                data = results;
                                datalength = results.length;
                                for(var i = 0; i < data.length; i++){
                                    if(data[i].total_sa == 0){
                                        datarecord++;
                                        continue;
                                    }
                                    pool.query(`UPDATE suggested_order s SET percentage_quantity = s.suggested_allocation_quantity/"${data[i].total_sa}" WHERE s.product_id = "${data[i].product_id}"`,
                                        (err,results) => {
                                        if(err){
                                            return callBack(err)
                                        }
                                        datarecord++;
                                        if(datarecord == datalength){
                                            return callBack(null,'Success in importing SA')
                                        }
                                    });
                            }   
                        })
                    }
            }); 
        })
    },
     /* edit allocation */
     editAllocation : (data , callBack) => {
         var length = 0;
         var record = 0;
         pool.query(
             `UPDATE suggested_order set updated_allocation_quantity= ${data.updated_so} WHERE suggested_id = ${data.suggested_id}`
             ,(error, results) => {
                     if(error){
                         return callBack(error)
                     }
                     pool.query(`SELECT suggested_id,suggested_allocation_quantity,updated_allocation_quantity,percentage_quantity FROM suggested_order  WHERE product_id = "${data.product_id}"`,
                        (err,listofproducts)=>{
                        if(err){
                            return callBack(err);
                        }
                        let total = 0;
                        console.log(listofproducts[0]['updated_allocation_quantity']);
                        for(var i = 0;i<listofproducts.length ; i++){
                            if(listofproducts[i]["updated_allocation_quantity"] > 0){
                                total += listofproducts[i]["updated_allocation_quantity"];
                            }else{
                                total += listofproducts[i]["suggested_allocation_quantity"];
                            }
                        }
                        
                        for(var x = 0; x< listofproducts.length; x++){
                            if(listofproducts[x]["updated_allocation_quantity"] > 0){
                                listofproducts[x]["percentage_quantity"] = listofproducts[x]["updated_allocation_quantity"] / total;
                            }else{
                                listofproducts[x]["percentage_quantity"] = listofproducts[x]["suggested_allocation_quantity"] / total;
                            }
                            pool.query(`UPDATE suggested_order SET percentage_quantity = ${listofproducts[x]["percentage_quantity"]} WHERE suggested_id = "${listofproducts[x]["suggested_id"]}"`,
                                (errup, resultsup) => {
                                    if(errup){
                                        return callBack(errup);
                                    }
                            });
                        }
                        
                        return callBack(null,"Successfully updated");
                     });
            }
         )
     },
    /* delete allocation */
    deleteAllocation : (id, callBack) => {
        pool.query(`SELECT DISTINCT product_id  FROM suggested_order WHERE suggested_id = "${id}"`,(err1,results1) => {
            if(err1){
                return callBack(err1)
            }
            
            pool.query(
                `DELETE FROM suggested_order WHERE suggested_id= ${id}`
                ,(error, results) => {
                    if(error){ 
                        console.log(error)
                        return callBack(error);
                    }
                    pool.query(`SELECT suggested_id,suggested_allocation_quantity,updated_allocation_quantity,percentage_quantity FROM suggested_order  WHERE product_id = "${results1[0].product_id}"`,
                        (err,listofproducts)=>{
                        if(err){
                            console.log(err)
                            return callBack(err);
                        }
                        let total = 0;
                        for(var i = 0;i<listofproducts.length ; i++){
                            if(listofproducts[i]["updated_allocation_quantity"] > 0){
                                total += listofproducts[i]["updated_allocation_quantity"];
                            }else{
                                total += listofproducts[i]["suggested_allocation_quantity"];
                            }
                        }
                        
                        for(var x = 0; x< listofproducts.length; x++){
                            if(listofproducts[x]["updated_allocation_quantity"] > 0){
                                listofproducts[x]["percentage_quantity"] = listofproducts[x]["updated_allocation_quantity"] / total;
                            }else{
                                listofproducts[x]["percentage_quantity"] = listofproducts[x]["suggested_allocation_quantity"] / total;
                            }
                            pool.query(`UPDATE suggested_order SET percentage_quantity = ${listofproducts[x]["percentage_quantity"]} WHERE suggested_id = "${listofproducts[x]["suggested_id"]}"`,
                                (errup, resultsup) => {
                                    if(errup){
                                        console.log(errup)
                                        return callBack(errup);
                                    }
                            });
                        }
                    });
                    return callBack(null, results);
                } 
            )
        });
    },

    /*Search By Product id or product name*/
    searchproduct : (data, callBack) => {
        pool.query(
            `SELECT * FROM suggested_order WHERE product_id LIKE "%${data.product_id}%" or product_name LIKE "%${data.product_name}%"`
            ,(error, results, fields) => {
                if(error){ 
                   return callBack(error);
                }
                return callBack(null, results);
            } 
        )
     }, 
    //Save final Allocation to distribution Table
    savefinalAllocation:(callBack) => {
        pool.query(`INSERT INTO distributions (branch,product_id,product_name,suggested_allocation_quantity,distribution_quantity,percentage_quantity)	
            SELECT s.branch,s.product_id,p.product_name,(CASE WHEN s.updated_allocation_quantity = 0 THEN s.suggested_allocation_quantity ELSE s.updated_allocation_quantity END) as PO_qty,0,s.percentage_quantity FROM suggested_order s
            JOIN products p ON p.product_id = s.product_id WHERE s.suggested_allocation_quantity > 0 || s.updated_allocation_quantity > 0`,
            function(err, results){
                if(err){
                    console.log(err)
                    return callBack(err)
                }
                return callBack(null,results);
            }
        );
    },
    //Empty Suggested allocation Table
    truncateAllocation:(callBack) => {
        pool.query('TRUNCATE suggested_order',
            function(err,results){
                if(err){
                    return callBack(err)
                }
                return callBack(null,results);
            }
        )
    }
} 