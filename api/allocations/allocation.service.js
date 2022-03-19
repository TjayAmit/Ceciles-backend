const res = require("express/lib/response");
const pool = require("../../config/database");
const csvtojson = require('csvtojson/v2');
const { off } = require("../../config/database");

module.exports = {
    /* get allocation specific branch*/
    getAllocation : (data, callBack) => {
        pool.query(
            `SELECT * FROM sa WHERE branch = "${data.branch}" `,
            (error, results, fields) => {
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
            'SELECT product_id,product_name,uom,uom_value,SUM(suggested_allocation_quantity) as total FROM sa GROUP BY product_id ASC',
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
            `SELECT * FROM sa`,
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
            `INSERT INTO sa(branch, product_id, product_name, uom, uom_value, available_inventory, sold_quantity, suggested_allocation_quantity, percentage_quantity) VALUES ("${data.branch}","${data.product_id}", "${data.product_name}", "${data.uom}", ${data.uom_value}, 0, 0, ${data.suggested_allocation_quantity},0 )`,
             (error, results, fields) => {
                    pool.query(`TRUNCATE total_suggestions`, function(err, results){
                        if (err){ 
                            throw err;
                        }
                        pool.query(`insert into total_suggestions SELECT product_id, product_name, sum(suggested_allocation_quantity) FROM sa GROUP BY product_id`, function(err, results){
                            if (err){ 
                                throw err;
                            }
                            console.log("process 6")
                            gettotalsugg(function(result1){
                                datatotal = result1;
                                                                
                                for(var i = 0; i < datatotal.length; i++){
                                    sap(datatotal[i].product_id,datatotal[i].total_suggested, function(result2,ts) {
                                        datasap =  result2;
                                                                    
                                        for(var j = 0; j < datasap.length; j++){
                                            if(ts === 0){
                                                continue;
                                            }
                                            pool.query(`UPDATE sa SET percentage_quantity = ${datasap[j].suggested_allocation_quantity/ts} WHERE suggested_id = ${datasap[j].suggested_id}`, function(err, results){
                                                if (err){ 
                                                    throw err;
                                                }
                                            })  
                                        }
                                    });
                                }
                            });
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
            return callBack(results);
        }); 
     },
     importCSVSales:async (data, callBack) => {
        const {filename,solddate} = data;
        await csvtojson().fromFile(`./csv/${filename}`).then(source => {
            console.log(source.length)
            var length = 0;
            if (source.length === 0){
              return res.status(500).json({ msg : "no data in the csv"});
            }
            // Fetching the data from each row 
            // and inserting to the table "sample"
            for (var i = 0; i < source.length; i++) {
                var branch = source[i]["Branch"],
                    product_id = source[i]["Product ID"],
                    principal_id = source[i]["Principal ID"],
                    product_name = source[i]["Product"],
                    sold_quantity = source[i]["Qty"]
                    
                var insertStatement = `INSERT INTO product_offtakes(branch,product_id,principal_id,	product_name,sold_quantity,sold_date) values(?,?,?,?,?,?)`;
                var items = [branch,product_id,principal_id,product_name,sold_quantity,solddate];
                

                // Inserting data of current row
                // into database
                pool.query(insertStatement, items, (err, results, fields) => {
                    if (err) {
                        return callBack(`Seems there is a problem at Row ${i+1}`)
                    }
                    length++;
                    if(length == source.length){
                        return callBack(null,'Sales Report Imported Successfully')
                    }
                });
            }
            
        })
        .catch(function (error) {
          console.log(error);
        });
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
       const {filename} = data;
       await csvtojson().fromFile(`./csv/${filename}`).then(source => {
           console.log(source.length)
           var length = 0;
           if (source.length === 0){
             return res.status(500).json({ msg : "no data in the csv"});
           }
           // Fetching the data from each row 
           // and inserting to the table "sample"
           
          for (var i = 0; i < source.length; i++) {
            var product_id = source[i]["Product ID"],
                product_name = source[i]["Name"],
                warehouse = source[i]["Warehouse"],
                stock_remaining = source[i]["Remaining"]
                unit = source[i]["Unit"]

              if(stock_remaining < 0 ) {
                stock_remaining = 0;
              }
              if( 
                warehouse == "A-CHOOSE WAREHOUSE-A" || 
                warehouse == "BO GROCERY 2017" || 
                warehouse == "BO PHARMA 2017" || 
                warehouse == "BO DEPARTMENT1" || 
                warehouse == "In Transit Office Warehouse" || 
                warehouse == "IN TRANSIT WAREHOUSE B.O" || 
                warehouse == "IN TRANSIT GROCERY B.O. 2017" || 
                warehouse == "IN TRANSIT PHARMA B.O. 2017" || 
                warehouse == "MAIN WAREHOUSE - For B.O Dep use only" || 
                warehouse == "MAIN WAREHOUSE 2016-FAD/BO USE ONLY" || 
                warehouse == "MAIN WAREHOUSE 2018 - FOR BO  SECTION USE ONLY" || 
                warehouse == "MAIN WAREHOUSE 2019 ( NOTE USE ONLY 2020 MAIN WAREHOUSE)" || 
                warehouse == "MAIN WAREHOUSE 2017 (BO USE ONLY)" || 
                warehouse == "OFFICE WAREHOUSE" || 
                warehouse == "WAREHOUSE B.O." || 
                warehouse == "MAIN WAREHOUSE FREEGOODS WH" || 
                warehouse == "In Transit Tumaga 2019" || 
                warehouse == "TUMAGA 2019"
              ) {
                length++;
                continue;
              }

              var insertStatement = `INSERT INTO stock_status values(?,?,?,?,?)`;
              var items = [product_id,product_name,stock_remaining,warehouse,unit];
      
              pool.query(insertStatement, items, (err, results, fields) => {
                  if (err) {
                      console.log("Unable to insert item at row ", i + 1);
                    return callBack(err)
                  } 
                length++;
                if(length == source.length){
                    return callBack(null,'Stock Status Imported Successfully')
                }
              })
          }
       })
       .catch(function (error) {
         console.log(error);
       });
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
            (error,results,fields) => { 
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
        var sql = `SELECT * FROM settings`;
        pool.query(sql, function(err, results){
                if (err){ 
                throw err;
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
    getalloproduct( product_id, modi,callback) {
            var sql = `SELECT * FROM sa WHERE product_id = "${product_id}"`;
            pool.query(sql, function(err, results){

                if (err){ 
                    throw err;
                }
                return callback(results,modi) ;
        })
    },
    getallobranch( branch,modi, callback) {
          var sql = `SELECT * FROM sa WHERE branch = "${branch}"`;
          pool.query(sql, function(err, results){
              
                if (err){ 
                  throw err;
                }
                return callback(results,modi) ;
         })
    },  
    getbranchproduct( branch, product, modi, callback) {
          var sql = `SELECT * FROM sa WHERE branch = "${branch}" AND product_id ="${product}"`;
          pool.query(sql, function(err, results){
              
                if (err){ 
                  throw err;
                }
                return callback(results,modi) ;
         })
    },
    gettotalsugg(callback) {
          var sql = `SELECT * FROM total_suggestions`;
          pool.query(sql, function(err, results){
            
                if (err){ 
                  throw err;
                }
                return callback(results) ;
         })
    },
    getsuggestedallo(modi,callback) {
          var sql = `SELECT * FROM sa`;
          pool.query(sql, function(err, results){
              
                if (err){ 
                  throw err;
                }
                return callback(results,modi);
         })
    },
    truncateSA:(callBack) => {
        pool.query('TRUNCATE sa',
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

        pool.query(`INSERT INTO sa (branch,product_id,product_name,uom,uom_value,available_inventory,sold_quantity,suggested_allocation_quantity) SELECT i.inventory_branch, p.product_id, p.product_name,p.uom,p.uom_value, i.quantity, po.sold_quantity,suo(i.quantity,po.sold_quantity,${inventory_goal},p.uom_value,${average_days}) sa FROM inventories i JOIN products p on i.product_id = p.product_id JOIN product_offtakes po on i.inventory_branch = po.branch AND i.product_id = po.product_id AND i.inventory_date = po.upload_date`, function(err, results){
            if (err){ 
                    throw err;
            }
                pool.query("SELECT * FROM modifiers JOIN variations on modifiers.fk_variation_id = variations.variation_id"
                    ,(err,result3) => {
                    if(err){
                        return callBack(err)
                    }
                    datamodifiers = result3

                    var date_ob = new Date();

                    for(var i = 0; i < datamodifiers.length; i++){
                    var startdate = new Date(datamodifiers[i].date_from);
                    var enddate = new Date(datamodifiers[i].date_to);
                    var product = datamodifiers[i].product;
                    var branch = datamodifiers[i].branch;
                    var modi = datamodifiers[i].variation_value;
                    
                    console.log(datamodifiers)
                        if(date_ob >= startdate  || date_ob <= enddate ){
                            if(branch === "ALL" && product === "ALL"){
                            getsuggestedallo(modi,function(result,m){
                                data1 = result;
                            
                                for(var n = 0; n < data1.length; n++){
                                var sq = data1[n].suggested_allocation_quantity;
                                var r = ((sq * m) + sq);
                                pool.query(`UPDATE sa SET suggested_allocation_quantity=${r} WHERE suggested_id = ${data1[n].suggested_id}`, (err, results, fields) => {
                                    if (err) {
                                        console.log(err)
                                        // return res.status(500).json({err});
                                    }
                                });
                                }
                            })
                            console.log("situation 1");
                            } 
                            if (branch === "ALL" && product != "ALL"){
                            getalloproduct(product,modi, function(result,m){
                                data2 = result;
                                console.log("situation 2"+ data2.length);
                                for(var f = 0; f < data2.length; f++){
                                var sq = data2[f].suggested_allocation_quantity;
                                var r = ((sq * m) + sq);
                                pool.query(`UPDATE sa SET suggested_allocation_quantity=${r} WHERE suggested_id = ${data2[f].suggested_id}`, (err, results, fields) => {
                                    if (err) {
                                        console.log(err)
                                        // return res.status(500).json({err});
                                    }
                                    console.log("success");
                                });
                                }
                            })  
                        
                            } 
                            if (product === "ALL" && branch != "ALL"){
                            getallobranch(branch, modi, function(result,m){
                                data3 = result;
                                console.log("situation 3  " +data3.length);

                                for(var n = 0; n < data3.length; n++){
                                var sq = data3[n].suggested_allocation_quantity;
                                var r = ((sq * m) + sq);
                                pool.query(`UPDATE sa SET suggested_allocation_quantity=${r} WHERE suggested_id = ${data3[n].suggested_id}`, (err, results, fields) => {
                                    if (err) {
                                        return res.status(500).json({err});
                                    }
                                console.log("success");
                                });
                                }
                            })
                            
                            } 
                            if(product != "ALL" && branch != "ALL"){
                            getbranchproduct(branch,product,modi,function(result,m){
                                data4 = result;
                                console.log("situation 4"+ data4.length);
                                var sq = data4[0].suggested_allocation_quantity;
                                var r = ((sq * m) + sq);
                                pool.query(`UPDATE sa SET suggested_allocation_quantity=${r} WHERE suggested_id = ${data4[0].suggested_id}`, (err, results, fields) => {
                                    if (err) {
                                        console.log(err)
                                        // return res.status(500).json({err});
                                    }
                                });
                            })
                            
                            }
                            console.log("working");
                        }
                    }
                pool.query(`TRUNCATE total_suggestions`, function(err, results){
                            if (err){ 
                                console.log(err)
                            }
                    pool.query(`insert into total_suggestions SELECT product_id, product_name, sum(suggested_allocation_quantity) FROM sa GROUP BY product_id`, function(err, results){
                            if (err){ 
                                console.log(err)
                            }
                            pool.query(`SELECT * FROM total_suggestions`,
                            (err,result1) => {
                                if(err){
                                    console.log(err)
                                }
                                datatotal = result1;
                                datalength = result1.length;
                                for(var i = 0; i < datatotal.length; i++){
                                    if(datatotal[i].total_suggested == 0){
                                        datarecord++;
                                        continue;
                                    }
                                    pool.query('UPDATE sa s JOIN total_suggestions t ON s.product_id = t.product_id  SET percentage_quantity = s.suggested_allocation_quantity/t.total_suggested WHERE s.product_id = ?',
                                        [datatotal[i].product_id]
                                    ,(err,results) => {
                                        if(err){
                                            return callBack(err)
                                        }
                                        datarecord++;
                                        if(datarecord == datalength){
                                            return callBack(null,'Success in importing SA')
                                        }
                                    });
                            }
                        });         
                    }) 
                });
            }); 
        })
    },
     /* edit allocation */
     editAllocation : (data , callBack) => {
         var length = 1;
         var record = 0;
         pool.query(
             `UPDATE sa set suggested_allocation_quantity= ${data.editSA} WHERE suggested_id = ${data.editSugID}`
             ,(error, results) => {
                     if(error){
                         return callBack(error)
                     }
                     pool.query(`SELECT product_name,SUM(suggested_allocation_quantity) as total FROM sa WHERE product_id = ? GROUP BY product_id`,[data.editPID], 
                            function(err, result){
                                var r = result
                                if (err){ 
                                    throw err
                                }
                                pool.query('SELECT suggested_id,suggested_allocation_quantity FROM sa WHERE product_id = ?',[
                                    data.editPID
                                ],
                                function(err, results2){
                                    length = results2.length;
                                    if(err){
                                        return callBack(err);
                                    }
                                    for(var i = 0; i< results2.length; i++){
                                        pool.query(`UPDATE sa SET percentage_quantity=suggested_allocation_quantity/? WHERE suggested_id = ?`
                                        ,[r[0].total,results2[i].suggested_id],
                                            (err,results) => {
                                                if(err){
                                                    return callBack(err)
                                                }   
                                                record++;
                                                if(record == length){
                                                    return callBack(null,'Updating Success')
                                                }
                                            }
                                        )
                                    }
                                });
                            });
            }
         )
     },

    /* delete allocation */
    deleteAllocation : (data, callBack) => {
        pool.query(
            `DELETE FROM sa WHERE suggested_id= ${data.suggested_id}`
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
            `SELECT * FROM sa WHERE product_id LIKE "%${data.product_id}%" or product_name LIKE "%${data.product_name}%"`
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
        pool.query(`INSERT INTO distributions (branch,product_id,product_name,suggested_allocation_quantity,distribution_quantity,percentage_quantity)	SELECT branch,product_id,product_name,suggested_allocation_quantity,0,percentage_quantity FROM sa WHERE suggested_allocation_quantity > 0`,
            function(err, results){
                if(err){
                    return callBack(err)
                }
                return callBack(null,results);
            }
        );
    },
    //Empty Suggested allocation Table
    truncateAllocation:(callBack) => {
        pool.query('TRUNCATE sa',
            function(err,results){
                if(err){
                    return callBack(err)
                }
                return callBack(null,results);
            }
        )
    }
} 