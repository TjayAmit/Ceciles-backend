const pool = require("../../config/database");

function getmodifiers(id,callback) {
      var sql = `SELECT * FROM modifiers JOIN variations on modifiers.fk_variation_id = variations.variation_id WHERE modifiers.modifier_id = ${id}`;
      pool.query(sql, function(err, results){
            if (err){ 
              throw err;
            }
            return callback(results);
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

function sap(productid,ts, callback) {
      var sql = `SELECT * FROM sa WHERE product_id = "${productid}"`;
      pool.query(sql, function(err, results){

            if (err){ 
              throw err;  
            }
            return callback(results,ts) ;
     })
}


module.exports = {
    /* read all */
    read_all_modifier : (callBack) => {
        pool.query(`SELECT m.modifier_id,(DATE_FORMAT(m.date_from, "%Y-%m-%d")) as date_from, (DATE_FORMAT(m.date_to, "%Y-%m-%d")) as date_to,m.branch,m.product,m.principal, v.variation_label,v.variation_value FROM modifiers as m JOIN variations as v on m.fk_variation_id = v.variation_id`,
             (error, results, fields) => {
              
                if(error){ 
                   return callBack(error);
                }
                return callBack(null, results);
            }
        )
    },
    /* read one */
    read_one_modifier : (id, callBack) => {
        pool.query(`SELECT m.modifier_id,(DATE_FORMAT(m.date_from, "%Y-%m-%d")) as date_from, (DATE_FORMAT(m.date_to, "%Y-%m-%d")) as date_to,m.branch,m.product,m.principal, v.variation_label,v.variation_value FROM modifiers as m JOIN variations as v on m.fk_variation_id = v.variation_id WHERE m.modifier_id = ${id}`,
             (error, results, fields) => {
                if(error){ 
                   return callBack(error);
                }
                return callBack(null, results);
            }
        )
    },
    /* create */
    create_modifier : (data,callBack) => {
        pool.query(`INSERT INTO modifiers(date_from,date_to,branch,product,principal,fk_variation_id) VALUES ("${data.date_from}","${data.date_to}","${data.branch}","${data.product}","${data.principal}",${data.fk_variation_id})`,
             (error, results, fields) => {

                getmodifiers(results.insertId,function(result3){
                    datamodifiers = result3

                    var date_ob = new Date();
                    var startdate = new Date(datamodifiers[0].date_from);
                    var enddate = new Date(datamodifiers[0].date_to);
                    var product = datamodifiers[0].product;
                    var branch = datamodifiers[0].branch;
                    var modi = datamodifiers[0].variation_value;

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

                                      pool.query(`TRUNCATE total_suggestions`, function(err, results){
                                      if (err){ 
                                              throw err;
                                      }});

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
                                      
                                   }

                });
                if(error){ 
                   return callBack(error);
                }
                return callBack(null, results);
            }
        )   
    },
    /* update */
    update_modifier : (data,id,callBack) => {
        pool.query(`UPDATE modifiers SET date_from="${data.date_from}",date_to="${data.date_to}",branch="${data.branch}",product="${data.product}",principal="${data.principal}",fk_variation_id= ${data.fk_variation_id} WHERE modifier_id = ${id}`,
             (error, results, fields) => {

                getmodifiers(id,function(result3){
                    datamodifiers = result3

                    var date_ob = new Date();
                    var startdate = new Date(datamodifiers[0].date_from);
                    var enddate = new Date(datamodifiers[0].date_to);
                    var product = datamodifiers[0].product;
                    var branch = datamodifiers[0].branch;
                    var modi = datamodifiers[0].variation_value;

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

                                      pool.query(`TRUNCATE total_suggestions`, function(err, results){
                                      if (err){ 
                                              throw err;
                                      }});

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
                                      
                                   }

                });

                if(error){ 
                   return callBack(error);
                }
                return callBack(null, results);
            }
        )  
    },
    /* delete */ 
    delete_modifier : (id,callBack) => {
        pool.query(`DELETE FROM modifiers WHERE modifier_id = ${id}`,
             (error, results, fields) => {
                if(error){ 
                   return callBack(error);
                }
                return callBack(null, results);
            }
        )  
    }
}