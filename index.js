require("dotenv").config();
const express = require("express");
const fileUpload = require('express-fileupload');
const csvtojson = require('csvtojson/v2');
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(fileUpload()); 
app.use(cors());


const modelRouter = require("./api/models/model.router");
const modifierRouter = require("./api/modifiers/modifier.router");
const variationRouter = require("./api/variations/variation.router");
const userRouter = require("./api/users/user.router");
const allocationRouter = require("./api/allocations/allocation.router");
const distributionRouter = require("./api/distributions/distribution.router");
const settingRouter = require("./api/settings/setting.router");
const branchRouter = require("./api/branches/branch.router");
const productRouter = require("./api/products/product.router");
const historyRouter = require("./api/history/history.router");



app.use("/ceciles/users", userRouter); 
app.use("/ceciles/distributions", distributionRouter); 
app.use("/ceciles/allocations", allocationRouter); 
app.use("/ceciles/models", modelRouter); 
app.use("/ceciles/variations", variationRouter); 
app.use("/ceciles/modifiers", modifierRouter); 
app.use("/ceciles/settings", settingRouter); 
app.use("/ceciles/branches", branchRouter); 
app.use("/ceciles/products", productRouter); 
app.use("/ceciles/history",historyRouter);


const pool = require("./config/database");
const { json } = require("express");

// file upload and store the data to the database of the Offtakes
app.post('/intodataps', (req, res) => {

    const { filename , solddate }  = req.body;

    const fileName = `./csv/${filename}`;

    console.log(fileName);

    csvtojson().fromFile(fileName).then(source => {
        console.log(source.length);
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
                    console.log("Unable to insert item at row ", i + 1);
                    return res.status(500).json({err});
                }
            });
        }
        return res.status(200).json({ msg : "CSV data successfully uploaded"});
    });
});


// file upload and store the server
app.post('/upload',  (req, res) => {
  if (req.files === null) {
    return res.status(400).json({ msg: 'No file uploaded' });
  }

  const file = req.files.file;
  file.mv(`${__dirname}/csv/${file.name}`, err => {
    if (err) {
      console.error(err);
      return res.status(500).send(err);
    }
  });

    return res.status(200).json({
       filename: file.name,
    });
});

// file upload and store the data to the database of the stock status
app.post('/intothedatabasess',  async (req, res) =>{

    const { filename }  = req.body;
      const fileName = `./csv/${filename}`;
      // deleting all the item in the database to refresh 
      var deleteStatement = `DELETE FROM stock_status`;
      pool.query(deleteStatement, (err, results, fields) => {
        if (err) {
            return res.status(500).json({err});
        }
      }); 

      console.log(fileName);
      await csvtojson().fromFile(fileName).then(source => {
          console.log(source.length);
          console.log("process 1")
          if (source.length === 0){
            return res.status(500).json({ msg : "no data in the csv"});
          }
          // Fetching the data from each row 
          // and inserting to the table "sample"
          for (var i = 0; i < source.length - 1; i++) {
            var product_id = source[i]["Product ID"],
                product_name = source[i]["Name"],
                warehouse = source[i]["Warehouse"],
                stock_remaining = source[i]["Remaining"],
                unit = source[i]["Unit"]

              if(stock_remaining < 0 ) {
                stock_remaining = 0;
              }
              if(warehouse == "GUSU2018" ) {
                warehouse = "GUSU 2018";
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
                continue;
              }

              var insertStatement = `INSERT INTO stock_status values(?,?,?,?,?)`;
              var items = [product_id,product_name,stock_remaining,warehouse,unit];
      
      
              // Inserting data of current row
              // into database
              pool.query(insertStatement, items, (err, results, fields) => {
                  if (err) {
                      console.log("Unable to insert item at row ", i + 1);
                      return res.status(500).json({err});
                  }
              })
          }
        
          keywordBranches(function(result){
            databranches = result;
            console.log("process 2")
            var deleteStatementinv = `DELETE FROM inventories`;
            pool.query(deleteStatementinv, (err, results, fields) => {
              if (err) {
                  return res.status(500).json({err});
              }
            });

            console.log("process 3")
            for(var i = 0; i < databranches.length; i++){
              pool.query(`INSERT INTO inventories(inventory_branch,product_id,product_name,quantity) SELECT "${databranches[i].branch_name}", product_id, product_name , SUM(stock_remaining) FROM stock_status WHERE warehouse IN ("${databranches[i].In_Transit_WH_Name}" ,"${databranches[i].Warehouse_Name}") AND product_name IN (SELECT DISTINCT product_name FROM stock_status) GROUP by product_name`, function(err, results){
                    if (err){ 
                      throw err;
                    }
            })
          }
          


            getsettings(function(result){
                      datasettings = result;
                      inventory_goal = datasettings[0].inventory_goal
                      average_days = datasettings[0].average_days

                      
                      console.log("process 4")  
                      pool.query(`INSERT INTO sa (branch,product_id,product_name,uom,uom_value,available_inventory,sold_quantity,suggested_allocation_quantity) SELECT i.inventory_branch, p.product_id, p.product_name,p.uom,p.uom_value, i.quantity, po.sold_quantity,suo(i.quantity,po.sold_quantity,${inventory_goal},p.uom_value,${average_days}) sa FROM inventories i JOIN products p on i.product_id = p.product_id JOIN product_offtakes po on i.inventory_branch = po.branch AND i.product_id = po.product_id AND i.inventory_date = po.upload_date`, function(err, results){
                              if (err){ 
                                      throw err;
                              }

                            console.log("process 5")
                            getmodifiers(function(result3){
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
                                                  return res.status(500).json({err});
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
                                                  return res.status(500).json({err});
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
                                                  return res.status(500).json({err});
                                              }
                                            });
                                        })
                                         
                                      }
                                      console.log("working");
                                   }

                              }
                            
                            
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
                      }); 
                        

                })
  
                }); 
            });
      
        return res.status(200).json({ msg_stock : "Stock status successfully updated"});
      }); 
})

app.get('/suggestedallocation', async (req, res) =>{
  const { branch }  = req.query
   keywordsuggestedallo(branch,function(result){
      // data = result;
      // return res.status(200).json({data: data})
      // console.log(result)
      // return JSON.stringify(req.params)
      return res.status(200).json(result)
    
   }); 
})

app.get('/saveSugg', async (req, res) =>{
   pool.query(`INSERT INTO history_sa SELECT branch,product_id,product_name,uom,uom_value,available_inventory,sold_quantity,suggested_allocation_quantity,percentage_quantity,allocation_date FROM sa WHERE suggested_allocation_quantity > 0`, function(err, results){
            if (err){ 
              throw err;
            }
            pool.query(`TRUNCATE sa`, function(err, results){
                if (err){ 
                  throw err;
                }
           })
  })
   return res.status(200).json({ msg_stock : "successfully Save"});
})

app.get('/saveDist', async (req, res) =>{
   pool.query(`INSERT INTO history_dist SELECT branch,product_id,product_name,uom,uom_value,available_inventory,sold_quantity,suggested_allocation_quantity,percentage_quantity,allocation_date FROM sa`, function(err, results){
            if (err){ 
              throw err;
            }
            
            pool.query(`TRUNCATE sa`, function(err, results){
                if (err){ 
                  
                  throw err;
                }
           })
  })
  
   return res.status(200).json({ msg_stock : "successfully Save"});
})

app.get('/distribution', async (req, res) =>{

    pool.query(`INSERT INTO distributions (branch,product_id,product_name,suggested_allocation_quantity,distribution_quantity,percentage_quantity)	SELECT branch,product_id,product_name,suggested_allocation_quantity,0,percentage_quantity FROM sa`, function(err, results){
  
      if (err){ 
              throw err;
      }
            pool.query(`TRUNCATE wi`, function(err, results){
            if (err){ 
                      throw err;
            }

            allproducts(function(resulta) {
            dataproducts = resulta
                            
            for(var k = 0; k < dataproducts.length; k++){
                pool.query(`insert into wi(product_id,product_name,quantity) Select products.product_id, roducts.product_name, (inventories.quantity/products.uom_value) FROM products JOIN inventories on products.product_id = inventories.product_id WHERE inventories.inventory_branch LIKE "%Main Warehouse%" AND inventories.product_id= "${dataproducts[k].product_id}"`, function(err, results){
                    if (err){ 
                              throw err;
                      }
                })  
            }

            inventoryWarehouse(function(result1){
            dataware = result1

              for(var i = 0; i < dataware.length ; i++){
                    if (dataware[i].quantity > 0){
                      getdistriproduct(dataware[i].product_id,dataware[i].quantity, function(result2,q){
                        datadistri = result2;
                          for(var j = 0; j < datadistri.length ; j++){
                            console.log(q + "__"+ datadistri[j].branch +"__"+ datadistri[j].product_id)
                             pool.query(`UPDATE distributions SET distribution_quantity=${q * datadistri[j].percentage_quantity} WHERE distribution_id = ${datadistri[j].distribution_id}`, function(err, results){
                                  if (err){   
                                    throw err;
                                  }
                            })
                          }
                      })
                    }
              }

            })         
          });
      })  
    });
   
   return res.status(200).json({ msg_stock : "successfully distri"});
})




function keywordBranches(callback) {
      var sql = "SELECT * FROM branches";
      pool.query(sql, function(err, results){
            if (err){ 
              throw err;
            }
            return callback(results);
     })
}

function inventoryWarehouse(callback) {
      var sql = `SELECT * FROM wi`
      pool.query(sql, function(err, results){
            if (err){ 
              throw err;
            }
            return callback(results);
     })
}


function allproducts(callback) {
      var sql = `SELECT * FROM products`;
      pool.query(sql, function(err, results){
            if (err){ 
              throw err;
            }
            return callback(results);
     })
}

function getmodifiers(callback) {
      var sql = "SELECT * FROM modifiers JOIN variations on modifiers.fk_variation_id = variations.variation_id";
      pool.query(sql, function(err, results){
            if (err){ 
              throw err;
            }
            return callback(results);
     })
}

function getdistriproduct( product_id,q, callback) {
      var sql = `SELECT * FROM distributions WHERE product_id = "${product_id}"`;
      pool.query(sql, function(err, results){

            if (err){ 
              throw err;
            }
            return callback(results,q) ;
     })
}

function getalloproduct( product_id, modi,callback) {
      var sql = `SELECT * FROM sa WHERE product_id = "${product_id}"`;
      pool.query(sql, function(err, results){

            if (err){ 
              throw err;
            }
            return callback(results,modi) ;
     })
}

function getallobranch( branch,modi, callback) {
      var sql = `SELECT * FROM sa WHERE branch = "${branch}"`;
      pool.query(sql, function(err, results){
          
            if (err){ 
              throw err;
            }
            return callback(results,modi) ;
     })
}

function getbranchproduct( branch, product, modi, callback) {
      var sql = `SELECT * FROM sa WHERE branch = "${branch}" AND product_id ="${product}"`;
      pool.query(sql, function(err, results){
          
            if (err){ 
              throw err;
            }
            return callback(results,modi) ;
     })
}


function getsuggestedallo(modi,callback) {
      var sql = `SELECT * FROM sa`;
      pool.query(sql, function(err, results){
          
            if (err){ 
              throw err;
            }
            return callback(results,modi);
     })
}

function gettotalsugg(callback) {
      var sql = `SELECT * FROM total_suggestions`;
      pool.query(sql, function(err, results){
        
            if (err){ 
              throw err;
            }
            return callback(results) ;
     })
}

function keywordsuggestedallo( branch, callback) {
      var sql = `SELECT * FROM sa WHERE branch = "${branch}"`;
      pool.query(sql, function(err, results){
          console.log(results)
            if (err){ 
              throw err;
            }
            return callback(results) ;
     })
}

function sap(productid,ts, callback) {
      var sql = `SELECT * FROM sa WHERE product_id = "${productid}"`;
      pool.query(sql, function(err, results){

            if (err){ 
              throw err;  
            }
            return callback(results,ts) ;
     })
}


function getsettings( callback) {
      var sql = `SELECT * FROM settings`;
      pool.query(sql, function(err, results){
            if (err){ 
              throw err;
            }
            return callback(results);
     })
}



app.post('/branches', (req, res) =>{

    const { file_name }  = req.body;

      const fileName = `./csv/${file_name}`;

      var deleteStatement = `DELETE FROM branches`;
      pool.query(deleteStatement, (err, results, fields) => {
        if (err) {
            return res.status(500).json({err});
        }
      });

      csvtojson().fromFile(fileName).then(source => {

          if (source.length === 0){
            return res.status(500).json({ msg : "no data in the csv"});
          }
          // Fetching the data from each row 
          // and inserting to the table "sample"
          for (var i = 0; i < source.length; i++) {
            var branch_id = source[i]["Branch ID"],
                branch_name = source[i]["Branch Name"],
                INT_code = source[i]["In Transit WH code"],
                INT_name = source[i]["In Transit WH Name"],
                warehouse_code = source[i]["Warehouse Code"],
                warehouse_name = source[i]["Warehouse Name"]

                //Branch ID	Branch Name	In Transit WH code	In Transit WH Name	Warehouse Code	Warehouse Name	branch keyword

              var insertStatement = `INSERT INTO branches values (?,?,?,?,?,?) `;
              var items = [branch_id,branch_name,INT_code,INT_name,warehouse_code,warehouse_name];
      
      
              // Inserting data of current row
              // into database
              pool.query(insertStatement, items, (err, results, fields) => {
                console.log(err);
                  if (err) {
                      console.log("Unable to insert item at row ", i + 1);
                      return res.status(500).json({err});
                  }
              })
          }
        return res.status(200).json({ msg : "Stock status successfully updated"});
      });
  
})

app.post('/products', (req, res) =>{

    const { file_name }  = req.body;

      const fileName = `./csv/${file_name}`;

      var deleteStatement = `DELETE FROM products`;
      pool.query(deleteStatement, (err, results, fields) => {
        if (err) {
            return res.status(500).json({err});
        }
      });

      csvtojson().fromFile(fileName).then(source => {

          if (source.length === 0){
            return res.status(500).json({ msg : "no data in the csv"});
          }
          // Fetching the data from each row 
          // and inserting to the table "sample"
          for (var i = 0; i < source.length; i++) {
            var product_id	= source[i]["Product ID"],
                product_name	= source[i]["Name"],
                uom	= source[i]["UOM"],
                uom_value	= source[i]["UOM VALUE"],
                principal_id	= source[i]["Principal ID"],
                principal_name = source[i]["Principal Name"];

                if(uom_value == 0 ){
                  uom_value = 1;
                }
              var insertStatement = `INSERT INTO products values(?,?,?,?,?,?)`;
              var items = [product_id,product_name,uom,uom_value,principal_id,principal_name];
      
      
              // Inserting data of current row
              // into database
              pool.query(insertStatement, items, (err, results, fields) => {
                  if (err) {
                      console.log("Unable to insert item at row ", i + 1);
                      return res.status(500).json({err});
                  }
              })
          }
        return res.status(200).json({ msg : "Stock status successfully updated"});
      });
  
})


app.listen(process.env.SERVER_PORT, () =>{
    console.log("Server is up and running at port ", process.env.SERVER_PORT);
});