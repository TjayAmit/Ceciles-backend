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