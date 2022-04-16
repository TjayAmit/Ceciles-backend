const pool = require("../../config/database");
const csvtojson = require('csvtojson/v2');


module.exports = {
    /*  */
    import_master_list:(data,callBack) => {
        const { filename }  = data;
        var record = 0;
        var length = 0;
        const fileName = `./csv/${filename}`;

        csvtojson().fromFile(fileName).then(source => {
  
            if (source.length === 0){
              return callBack(null,'File is Empty');
            }
            // Fetching the data from each row 
            // and inserting to the table "sample"
            length = source.length;
            for (var i = 0; i < source.length; i++) {
              var product_id	= source[i]["Product ID"],
                  product_name	= source[i]["Name"],
                  uom	= source[i]["UOM"],
                  uom_value	= source[i]["UOM VALUE"],
                  principal_id	= source[i]["Principal ID"],
                  principal_name = source[i]["Principal Name"],
                  price = source[i]["Price"];
  
                  if(uom_value == 0 ){
                    uom_value = 1;
                  }
                var insertStatement = `INSERT INTO products values(?,?,?,?,?,?,?)`;
                // var items = [product_id,product_name,uom,uom_value,principal_id,principal_name];
                
                var items = [product_id,product_name,uom,uom_value,principal_id,principal_name,price];
        
                // Inserting data of current row
                // into database
                pool.query(insertStatement, items, (err, results) => {
                    if (err) {
                        if(!(err.message.includes("ER_DUP_ENTRY"))){
                            console.log(err)
                            return callBack(err);
                        }
                    }
                    record++;
                    if(record == length){
                        return callBack(null,"Importing Success");
                    }
                })
            }
        });
    },
    /* retrieve manufacturer principal id */
    read_all_manufacturer: (callBack) => {
        pool.query(`SELECT principal_id,principal_name FROM products GROUP BY principal_name`, 
            (error,results) => {
                if(error){
                    console.log('HAPPEN')
                    return callBack(error);
                }
                return callBack(null,results);
            });
    },
    /* read all */
    read_all_product : (callBack) => {
        pool.query(`SELECT * FROM products`,
             (error, results, fields) => {
                if(error){ 
                   return callBack(error);
                }
                return callBack(null, results);
            }
        )
    },
    /* read one */
    read_one_product : (id, callBack) => {
        pool.query(`SELECT * FROM products WHERE product_id = ${id}`,
             (error, results, fields) => {
                if(error){ 
                   return callBack(error);
                }
                return callBack(null, results);
            }
        )
    },
    /* create */
    create_product : (data,callBack) => {
        pool.query(`SELECT * FROM products WHERE product_id="${data.productid}"`,
            (err,results) => {
                if(err){
                    return callBack(err)
                } 
                if(results.length > 0){
                    return callBack(null,'Product Already Exist');
                }
                pool.query(`INSERT INTO products(product_id,product_name,product_price,uom,uom_value,principal_id,principal_name) 
                    VALUES ("${data.productid}","${data.productname}",${data.productprice},"${data.moqlabel}","${data.moqvalue}","${data.principalid}","${data.principalname}")`,
                     (error, results) => {
                        if(error){ 
                           return callBack(error);
                        }
                        return callBack(null, results);
                    }
                )   
            })
    },
    /* update */
    update_product : (data,callBack) => {
        pool.query(`UPDATE products SET product_name="${data.productname}",product_price=${data.productprice}, uom = "${data.moqlabel}", uom_value = ${data.moqvalue}, principal_id = "${data.principalid}", principal_name = "${data.principalname}" WHERE product_id = "${data.productid}"`,
             (error, results) => {
                if(error){ 
                   return callBack(error);
                }
                return callBack(null, results);
            }
        )  
    },
    /* delete */ 
    delete_product : (id,callBack) => {
        pool.query(`DELETE FROM products WHERE product_id = "${id}"`,
             (error, results) => {
                if(error){ 
                   return callBack(error);
                }
                return callBack(null, results);
            }
        )  
    }
}