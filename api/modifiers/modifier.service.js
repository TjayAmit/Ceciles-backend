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
        pool.query(`SELECT m.modifier_id,(DATE_FORMAT(m.date_from, "%Y-%m-%d")) as date_from, (DATE_FORMAT(m.date_to, "%Y-%m-%d")) as date_to,m.branch,m.product,m.principal, v.variation_label,v.variation_value FROM modifiers as m JOIN variations as v on v.variation_id = m.fk_variation_id`,
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
        var date_ob = new Date();
        var datarecord = 0;
        var datalength = 0;
        pool.query(`INSERT INTO modifiers(date_from,date_to,branch,product,principal,fk_variation_id) VALUES ("${data.date_from}","${data.date_to}","${data.branch_id}","${data.product_id}","${data.principal_id}",${data.variation_id})`,
          (error, results) => {
            if(error){
              return callBack(error)
            }
            
            var startdate = new Date(data.date_from);
            var enddate = new Date(data.date_to);
            var product = data.product_id;
            var branch = data.branch_id;
            var manufacturer = data.principal_id;
            var modi = data.variation_id;
            var query = `UPDATE sa s JOIN variations v ON v.variation_id = ${modi} `;
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
                  query += ` JOIN products p ON s.product_id = p.product_id AND p.principal_id = "${manufacturer}" `;
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
                  
                  pool.query(`SELECT s.product_id, sum(s.suggested_allocation_quantity) AS total_sa,SUM(i.quantity) AS total_quantity FROM sa s
                      JOIN inventories i ON s.product_id = i.product_id AND  i.inventory_branch = 'MAIN WAREHOUSE1' GROUP BY product_id `, 
                      (err, results3) =>{
                        if (err){ 
                          return callBack(err);
                        }
                        data = results3;
                        datalength = results3.length;
                        for(var i = 0; i < data.length; i++){
                            if(data[i].total_sa == 0){
                                datarecord++;
                                continue;
                            }
                            pool.query(`UPDATE sa s SET 
                                inventory_status = CASE WHEN "${data[i].total_quantity}" > "${data[i].total_sa}" THEN 1 ELSE 0 END,
                                percentage_quantity = s.suggested_allocation_quantity/"${data[i].total_sa}" WHERE s.product_id = "${data[i].product_id}"`,
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
                    });           
                }
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
             (error, results) => {
                if(error){ 
                   return callBack(error);
                }
                return callBack(null, results);
            }
        )  
    }
}