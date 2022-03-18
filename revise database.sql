CREATE DATABASE cecilesdatabase2;

CREATE TABLE users(
    user_id INTEGER AUTO_INCREMENT PRIMARY KEY,
    user_first_name VARCHAR(50) NOT NULL,
    user_last_name VARCHAR(50) NOT NULL,
    user_sex VARCHAR(6) NOT NULL,
    user_username VARCHAR(50) NOT NULL,
    user_password VARCHAR(100) NOT NULL
);

CREATE TABLE stock_status(
    product_id VARCHAR(50) NOT NULL,
    product_name VARCHAR(50) NOT NULL,
    stock_remaining INTEGER NOT NULL,
    warehouse VARCHAR(50) NOT NULL,
    unit VARCHAR(50) NOT NULL
);

CREATE TABLE product_offtakes(
    branch VARCHAR(50) NOT NULL,
    product_id VARCHAR(50) NOT NULL, 
    principal_id VARCHAR(50) NOT NULL,
    product_name VARCHAR(50) NOT NULL,
    sold_quantity INTEGER NOT NULL,
    sold_date DATE NOT NULL,
    upload_date DATE NOT NULL DEFAULT CURRENT_DATE()
);

CREATE TABLE inventories(
    inventory_id INTEGER AUTO_INCREMENT PRIMARY KEY,
    inventory_branch VARCHAR(50) NOT NULL,
    inventory_date DATE NOT NULL DEFAULT CURRENT_DATE(),
    product_id  VARCHAR(50) NOT NULL,
    product_name VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL
);

CREATE TABLE branches(
    branch_id VARCHAR(255) PRIMARY KEY,
    branch_name VARCHAR(255) NOT NULL,
    In_Transit_WH_code VARCHAR(255) NOT NULL,
    In_Transit_WH_Name VARCHAR(255) NOT NULL,
    Warehouse_Code VARCHAR(255) NOT NULL,
    Warehouse_Name VARCHAR(255) NOT NULL,
);

CREATE TABLE distribution_history(
    history_id INTEGER AUTO_INCREMENT PRIMARY KEY,
    branch VARCHAR(50) NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    suggested_allocation_quantity INTEGER NOT NULL,
    distribution_quantity INTEGER NOT NULL DEFAULT 0,
    percentage_quantity FLOAT NOT NULL DEFAULT 0,
    allocation_date DATE NOT NULL,
    distribution_date DATE NOT NULL DEFAULT CURRENT_DATE()
);

CREATE TABLE products(
    product_id VARCHAR(150) NOT NULL PRIMARY KEY,
    product_name VARCHAR(150) NOT NULL,
    uom VARCHAR(10) NOT NULL,
    uom_value INTEGER NOT NULL,
    principal_id VARCHAR(150) NOT NULL,
    principal_name VARCHAR(150) NOT NULL  
);

CREATE TABLE settings (
    settings_id INTEGER PRIMARY KEY, 
    inventory_goal INTEGER NOT NULL, 
    average_days INTEGER NOT NULL 
);

CREATE TABLE total_suggestions (
    product_id VARCHAR(150) NOT NULL PRIMARY KEY,
    product_name VARCHAR(150) NOT NULL,
    total_suggested INTEGER NOT NULL 
);

CREATE TABLE wi (
    wi_id INTEGER AUTO_INCREMENT PRIMARY KEY,
    product_id  VARCHAR(50) NOT NULL,
    product_name VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL
);

CREATE TABLE variations(
    variation_id INTEGER AUTO_INCREMENT PRIMARY KEY,
    variation_label  VARCHAR(50) NOT NULL,
    variation_value FLOAT NOT NULL
);


CREATE TABLE modifiers (
    modifier_id INTEGER AUTO_INCREMENT PRIMARY KEY, 
    date_from DATE NOT NULL, 
    date_to DATE NOT NULL, 
    branch VARCHAR(150) NOT NULL,
    product VARCHAR(150) NOT NULL,
    principal VARCHAR(150) NOT NULL,
    fk_variation_id INTEGER NOT NULL,
    FOREIGN KEY (fk_variation_id) REFERENCES variations(variation_id)
);

/*PROCEDURE TO INSERT DISTRIBUTION TO DISTRIBUTION_HISTORY BEGIN*/
CREATE PROCEDURE proc_cursor_to_loopAndInsert()
BEGIN
  DECLARE CURSOR_BRANCH VARCHAR(50);
  DECLARE CURSOR_PRODUCT_ID VARCHAR(50);
  DECLARE CURSOR_SUGGESTED_ALLO INT;
  DECLARE CURSOR_DISTRIBUTION_QUANTITY INT;
  DECLARE CURSOR_PERCENT FLOAT;
  DECLARE CURSOR_ALLO_DATE DATE;
  DECLARE done INT DEFAULT FALSE;
  DECLARE distribution_cursor CURSOR FOR SELECT branch,product_id,suggested_allocation_quantity,distribution_quantity,percentage_quantity,allocation_date FROM distributions;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
  OPEN distribution_cursor;
  loop_through_rows LOOP
    FETCH distribution_cursor INTO CURSOR_BRANCH,CURSOR_PRODUCT_ID,CURSOR_SUGGESTED_ALLO,CURSOR_DISTRIBUTION_QUANTITY,CURSOR_PERCENT,CURSOR_ALLO_DATE;
    IF done THEN
      LEAVE loop_through_rows;
    END IF;
    INSERT INTO distribution_history(branch,product_id,suggested_allocation_quantity,distribution_quantity,percentage_quantity,allocation_date) VALUES(CURSOR_BRANCH,CURSOR_PRODUCT_ID,CURSOR_SUGGESTED_ALLO,CURSOR_DISTRIBUTION_QUANTITY,CURSOR_PERCENT,CURSOR_ALLO_DATE);
  END LOOP;
  CLOSE proc_cursor_to_loopAndInsert;
END;
;;
/*PROCEDURE TO INSERT DISTRIBUTION TO DISTRIBUTION_HISTORY END*/
INSERT INTO `settings`(`settings_id`, `inventory_goal`,`average_days`) VALUES (1,30,30);


DROP FUNCTION IF EXISTS `suggestedallo`$$
CREATE FUNCTION `suggestedallo`( iq INT, sq INT, ig INT) RETURNS INT
BEGIN
	DECLARE res INT;
    
    SET res = ((sq/30) * ig) - iq;
	
	IF (res >= 0) THEN
     	RETURN res;
   	ELSEIF (res < 0)  THEN
      	RETURN 0;
   	END IF;
END;
$$

DELIMITER ;


CREATE TABLE sa(
    suggested_id INTEGER AUTO_INCREMENT PRIMARY KEY,
    branch VARCHAR(50) NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    product_name VARCHAR(50) NOT NULL,
    uom VARCHAR(10) NOT NULL,
    uom_value INTEGER NOT NULL,
    available_inventory INTEGER NOT NULL,
    sold_quantity INTEGER NOT NULL,
    suggested_allocation_quantity INTEGER NOT NULL,
    percentage_quantity FLOAT NOT NULL DEFAULT 0,
    allocation_date DATE NOT NULL DEFAULT CURRENT_DATE()
);

CREATE TABLE distributions(
    distribution_id INTEGER AUTO_INCREMENT PRIMARY KEY,
    branch VARCHAR(50) NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    product_name VARCHAR(50) NOT NULL,
    suggested_allocation_quantity INTEGER NOT NULL,
    distributed_quantity INTEGER NOT NULL DEFAULT 0,
    distribution_quantity INTEGER NOT NULL DEFAULT 0,
    percentage_quantity FLOAT NOT NULL DEFAULT 0,
    allocation_date DATE NOT NULL DEFAULT CURRENT_DATE()
);



DELIMITER $$ 

DROP FUNCTION IF EXISTS `suo`$$
CREATE FUNCTION `suo`( iq INT, sq INT, ig INT, uv INT,ad INT) RETURNS INT
BEGIN
	DECLARE res INT;
    DECLARE res2 FLOAT;
    
    SET res = ((sq/ad) * ig) - iq;
	
	IF (res >= 0) THEN
        SET res2 = res/uv;

        IF (res2 > 0 AND res2 < .5) THEN
            SET res = 1;
        END IF;

     	RETURN res2;
   	ELSEIF (res < 0)  THEN
      	RETURN 0;
   	END IF;
END;
$$

DELIMITER ;



/*--------------------------------------------------------- END*/






DELIMITER $$ 

DROP FUNCTION IF EXISTS `suggestedallo`$$
CREATE FUNCTION `suggestedallo`( iq INT, sq INT, ig INT) RETURNS INT
BEGIN
	DECLARE res INT;
    
    SET res = (iq-((sq/30)) * ig);
	
	IF (res >= 0) THEN
     	RETURN res;
   	ELSEIF (res < 0)  THEN
      	RETURN 0;
   	END IF;
END;
$$

DELIMITER ;


DELIMITER $$ 

DROP FUNCTION IF EXISTS `inventoryBranch`$$
CREATE FUNCTION `inventoryBranch`(in_string varchar(50)) 
RETURNS varchar(50)

BEGIN
	DECLARE invetory_branch varchar(50);
    CASE in_string
        WHEN "ALANO 2018" OR "In transit Alano 2018" THEN SET invetory_branch = "ALANO";
        WHEN "CAWA CAWA 2019" OR "In Transit Cawa-Cawa 2019" THEN SET invetory_branch = "CAWA";
        WHEN "CITI MART" OR "In transit CITI MART" THEN SET invetory_branch = "CITIMART";
        WHEN "GUSU 2018" OR "In Transit GUSU 2018" THEN SET invetory_branch = "GUSU";
        WHEN "STA CATALINA 2019" OR "In Transit Sta Catalina 2019" THEN SET invetory_branch = "STA CATALINA";
        WHEN "CPCS TUMAGA 2  2021" OR "In Transit Tumaga 2  2021" THEN SET invetory_branch = "TUMAGA";
        WHEN "DIVISORIA 2019" OR "In Transit Divisoria 2019" THEN SET invetory_branch = "DIVISORIA";
        WHEN "GUIWAN TERMINAL 2017" OR "IN TRANSIT GUIWAN TERMINAL 2017" THEN SET invetory_branch = "GUIWAN - TERMINAL";
        WHEN "GUIWAN OLD 2019" OR "In Transit Guiwan Old 2019" THEN SET invetory_branch = "GUIWAN - OLD";
        WHEN "STA MARIA 1 2019" OR "In transit Sta Maria 1 2019" THEN SET invetory_branch = "STA MARIA 1";
        WHEN "STA MARIA 2 2019" OR "In transit Sta Maria 2 2019" THEN SET invetory_branch = "STA MARIA 2";
        WHEN "VET 2" OR "IN TRANSIT VETERANS 2" THEN SET invetory_branch = "NEW VETERANS 2";
        WHEN "SAN JOSE MAIN 2019" OR "In Transit San Jose 2019" THEN SET invetory_branch = "SAN JOSE";
        WHEN "SAN ROQUE 2019" OR "In Transit San Roque 2019" THEN SET invetory_branch = "SAN ROQUE";
        WHEN "Tetuan 2018" OR "In transit Tetuan 2018" THEN SET invetory_branch = "TETUAN";
        WHEN "Tetuan Yubenco 2017" OR "In transit Tetuan Yubenco 2017" THEN SET invetory_branch = "TETUAN YUBENCO";
        WHEN "Sta Cruz 2019" OR "IN TRANSIT STA CRUZ 2019" THEN SET invetory_branch = "STACRUZ";
        WHEN "Talon-talon 2018" OR "In Transit Talon-talon 2018" THEN SET invetory_branch = "TALON TALON";
        WHEN "SCC WEST GUSU 2019" OR "In Transit SCC West Gusu 2019" THEN SET invetory_branch = "WEST GUSU";
        WHEN "Tugbungan 2018" OR "In Transit Tugbungan 2018" THEN SET invetory_branch = "TUGBUNGAN";
        WHEN "IPIL" OR "IPIL STOCK ROOM STORAGE WAREHOUSE" OR "IN TRANSIT IPIL" THEN SET invetory_branch = "IPIL";
        ELSE SET invetory_branch = in_string;
    END CASE;
    RETURN invetory_branch;
END;
$$

DELIMITER ;





/*

    For the postman testing 
 
 user account
{
        "first_name": "",
        "last_name" : "",
        "sex": "" ,            
        "username": "",
        "password": ""
}
{
        "branch" : "GUIWAN - OLD",
        "product_id" : "PI000000000139",	
        "product_name" : "ALAXAN FR CAP",	
        "suggested_allocation_quantity"	: "340",
        "allocation_date" : "2021-12-03"	
}  
*/

/*
   dashboard
*/


-- Overall sold quantity in every month for especific product_name 
-- Overall sold quantity in every product in especfic month 
-- Sold quantity for every branch in especific product_name and date
-- most saleable product in the especific branch and especific date
-- least saleable product in the especific branch and especific date
-- average per day sold every medicine in specific branch

-- Overall sold quantity in every month for especific product_name
SELECT SUM(sold_quantity) as quantity, sold_date, product_name FROM `product_offtakes` WHERE product_name = "ALAXAN FR CAP" GROUP BY sold_date;
-- Overall sold quantity in every product in especfic month
SELECT SUM(sold_quantity) as quantity, sold_date, product_name FROM `product_offtakes` WHERE sold_date = "2021-07-01" GROUP BY product_name;
-- Sold quantity for every branch in especific product_name and date
SELECT branch, sold_quantity, sold_date FROM `product_offtakes` WHERE product_name = "ALAXAN FR CAP" AND sold_date = "2021-07-01" ORDER BY sold_quantity DESC;
-- most saleable product in the especific branch and especific date
SELECT * FROM `product_offtakes` WHERE branch = "ALANO" AND sold_date ="2021-07-01" ORDER BY sold_quantity DESC;
-- least saleable product in the especific branch and especific date
SELECT * FROM `product_offtakes` WHERE branch = "ALANO" AND sold_date ="2021-07-01" ORDER BY sold_quantity ASC;
-- average per day sold every medicine in specific branch
SELECT (sold_quantity / CAST(DAY(LAST_DAY(sold_date)) AS DECIMAL)) as average_quantity_sold , product_name, branch FROM product_offtakes WHERE sold_date = "2021-07-01" AND branch = "ALANO" ORDER BY average_quantity_sold DESC;


/*
    stock_status
*/

-- all availble stock accending order
SELECT * FROM `stock_status` ORDER BY stock_remaining ASC;
-- all availabe stock decceding order
SELECT * FROM `stock_status` ORDER BY stock_remaining DESC;
-- avaible stock in especific warehouse deccending
SELECT * FROM `stock_status` WHERE warehouse = "MAIN WAREHOUSE 2020" ORDER BY stock_remaining DESC;
-- avaible stock in especific warehouse asending
SELECT * FROM `stock_status` WHERE warehouse = "MAIN WAREHOUSE 2020" ORDER BY stock_remaining DESC;


/*
    singular values
*/

-- list of the branches name
SELECT DISTINCT branch FROM product_offtakes;
-- list of the warehouses 
SELECT DISTINCT warehouse FROM stock_status;
-- List of the product id and its product name
SELECT DISTINCT product_id, product_name FROM stock_status;
-- List of the Dates available 
SELECT DISTINCT DATE_FORMAT(sold_date , "%M %Y") as month_year FROM `product_offtakes`;
-- Search product
SELECT product_id, product_name FROM stock_status WHERE product_id LIKE %% AND product_name LIKE %%;



-- For Allocations 
-- Selecting all the nessesary warehouse
SELECT DISTINCT warehouse FROM stock_status WHERE warehouse NOT LIKE "%in transit%" AND warehouse NOT LIKE "%BO%";

-- in transits 
SELECT DISTINCT warehouse FROM stock_status 
WHERE warehouse LIKE "%in transit%" 
AND warehouse NOT LIKE "%BO%" 
AND warehouse NOT LIKE "%B.O.%"
AND warehouse NOT LIKE "%B.O%";

-- in branches
SELECT DISTINCT warehouse FROM stock_status 
WHERE warehouse NOT LIKE "%in transit%" 
AND warehouse NOT LIKE "%BO%" 
AND warehouse NOT LIKE "%B.O.%"
AND warehouse NOT LIKE "%B.O%";




-- in transits inventory
SELECT *  FROM `stock_status` WHERE warehouse IN (SELECT DISTINCT warehouse FROM stock_status WHERE warehouse LIKE "%in transit%" AND warehouse NOT LIKE "%BO%" AND warehouse NOT LIKE "%B.O.%" AND warehouse NOT LIKE "%B.O%")  AND product_name IN (SELECT DISTINCT product_name FROM stock_status)

-- in branches invetory
SELECT *  FROM `stock_status` WHERE warehouse IN (SELECT DISTINCT warehouse FROM stock_status WHERE warehouse NOT LIKE "%in transit%" AND warehouse NOT LIKE "%BO%" AND warehouse NOT LIKE "%B.O.%" AND warehouse NOT LIKE "%B.O%")  AND product_name IN (SELECT DISTINCT product_name FROM stock_status)

SELECT DISTINCT warehouse FROM stock_status WHERE warehouse NOT LIKE "%in transit%" AND warehouse NOT LIKE "%BO%" AND warehouse NOT LIKE "%B.O.%" AND warehouse NOT LIKE "%B.O%" AND warehouse NOT LIKE "%warehouse%";

SELECT Sum(stock_remaining) FROM `stock_status` WHERE warehouse LIKE '%alano%' AND product_name = "ALAXAN FR CAP";


SELECT *  FROM `stock_status` WHERE warehouse LIKE '%alano%' AND product_name IN (SELECT DISTINCT product_name FROM stock_status);

SELECT *  FROM `stock_status` 
WHERE 
warehouse LIKE '%in transit alano%' 
AND 
product_name IN (SELECT DISTINCT product_name FROM stock_status);

SELECT *  FROM `stock_status` 
WHERE 
warehouse LIKE 'alano%' 
AND 
product_name IN (SELECT DISTINCT product_name FROM stock_status);


-- core query
SELECT DISTINCT warehouse FROM `stock_status` WHERE warehouse NOT LIKE "%transit%" AND warehouse NOT IN ("A-CHOOSE WAREHOUSE-A",
"BO GROCERY 2017",
"BO PHARMA 2017",
"BO DEPARTMENT1",
"In Transit Office Warehouse",
"IN TRANSIT WAREHOUSE B.O",
"IN TRANSIT GROCERY B.O. 2017",
"IN TRANSIT PHARMA B.O. 2017",
"MAIN WAREHOUSE - For B.O Dep use only",
"MAIN WAREHOUSE 2016-FAD/BO USE ONLY",
"MAIN WAREHOUSE 2018 - FOR BO  SECTION USE ONLY",
"MAIN WAREHOUSE 2019 ( NOTE USE ONLY 2020 MAIN WARE",
"MAIN WAREHOUSE 2017 (BO USE ONLY)",
"OFFICE WAREHOUSE",
"WAREHOUSE B.O.",
"MAIN WAREHOUSE FREEGOODS WH");

SELECT product_name , SUM(stock_remaining) , warehouse FROM `stock_status` WHERE warehouse LIKE '%alano%' AND product_name IN (SELECT DISTINCT product_name FROM stock_status) GROUP by product_name;


-- it part sample 


SELECT product_name , SUM(stock_remaining) , warehouse FROM `stock_status` WHERE warehouse LIKE '%alano%' AND product_name IN (SELECT DISTINCT product_name FROM stock_status) GROUP by product_name LIMIT 5;

-- 	inventory_branch	inventory_date	product_id	product_name	quantity	



--test run
INSERT INTO `invetories` (inventory_branch,	product_id,	product_name, quantity) SELECT inventoryBranch(warehouse), product_id, product_name , SUM(stock_remaining) FROM `stock_status` WHERE warehouse LIKE '%?%' AND product_name IN (SELECT DISTINCT product_name FROM stock_status) GROUP by product_name;

SELECT * FROM `invetories` JOIN product_offtakes on invetories.inventory_branch = product_offtakes.branch AND invetories.product_id = product_offtakes.product_id AND invetories.inventory_date = product_offtakes.sold_date ORDER BY invetories.product_name;

((product_offtakes.sold_quantity * .5) + product_offtakes.sold_quantity)

SELECT invetories.inventory_branch , invetories.product_id, invetories.product_name, invetories.quantity as inventory, product_offtakes.sold_quantity as offtakes, product_offtakes.sold_date as date_month FROM `invetories` JOIN product_offtakes on invetories.inventory_branch = product_offtakes.branch AND invetories.product_id = product_offtakes.product_id AND invetories.inventory_date = product_offtakes.sold_date ORDER BY invetories.product_name;



on invetories.inventory_branch = product_offtakes.branch AND invetories.product_id = product_offtakes.product_id AND 

INSERT INTO suggestedallocation (branch,product_id,product_name,available_inventory,sold_quantity,suggested_allocation_quantity) SELECT invetories.inventory_branch, invetories.product_id, invetories.product_name, invetories.quantity , product_offtakes.sold_quantity,((product_offtakes.sold_quantity * .5) + product_offtakes.sold_quantity)  FROM `invetories` JOIN product_offtakes on invetories.inventory_branch = product_offtakes.branch AND invetories.product_id = product_offtakes.product_id AND invetories.inventory_date = product_offtakes.sold_date;


SELECT * FROM inventories i JOIN products p on i.product_id = p.product_id JOIN product_offtakes po on i.inventory_branch = po.branch AND i.product_id = po.product_id AND i.inventory_date = po.upload_date;

SELECT i.inventory_branch, p.product_id, p.product_name,p.uom,p.uom_value, i.quantity, po.sold_quantity,suggestedallo(i.quantity,po.sold_quantity,30) sa FROM inventories i JOIN products p on i.product_id = p.product_id JOIN product_offtakes po on i.inventory_branch = po.branch AND i.product_id = po.product_id AND i.inventory_date = po.upload_date;


INSERT INTO sa (branch,product_id,product_name,uom,uom_value,available_inventory,sold_quantity,suggested_allocation_quantity) SELECT i.inventory_branch, p.product_id, p.product_name,p.uom,p.uom_value, i.quantity, po.sold_quantity,suo(i.quantity,po.sold_quantity,30) sa FROM inventories i JOIN products p on i.product_id = p.product_id JOIN product_offtakes po on i.inventory_branch = po.branch AND i.product_id = po.product_id AND i.inventory_date = po.upload_date;

INSERT INTO sa (branch,product_id,product_name,uom,uom_value,available_inventory,sold_quantity,suggested_allocation_quantity) SELECT i.inventory_branch, p.product_id, p.product_name,p.uom,p.uom_value, i.quantity, po.sold_quantity,suo(i.quantity,po.sold_quantity,30,p.uom_value) sa FROM inventories i JOIN products p on i.product_id = p.product_id JOIN product_offtakes po on i.inventory_branch = po.branch AND i.product_id = po.product_id AND i.inventory_date = po.upload_date;


/* total quantity for ever medicine suggested */
insert into total_suggestion SELECT product_id, product_name, sum(suggested_allocation_quantity) FROM `sa` GROUP BY product_id;


insert into wi(product_id,product_name,quantity) Select product_id, product_name, FROM products JOIN inventories on products.product_id = inventories.product_id WHERE inventories.inventory_branch LIKE "%Main Warehouse%" AND inventories.product_id= "PI000000000139";

insert into wi(product_id,product_name,quantity) Select products.product_id, products.product_name, (inventories.quantity/products.uom_value) FROM products JOIN inventories on products.product_id = inventories.product_id WHERE inventories.inventory_branch LIKE "%Main Warehouse%" AND inventories.product_id= "PI000000000139";

/* PRIORTIRY QUERY */
SELECT * FROM product_offtakes WHERE product_name = "ALAXAN FR CAP" and branch in (SELECT branch_name FROM branches) ORDER by sold_quantity DESC LIMIT 3;

pool.query(`INSERT INTO distributions (branch,product_id,product_name,suggested_allocation_quantity,distribution_quantity,percentage_quantity)	SELECT branch,product_id,product_name,suggested_allocation_quantity,0,percentage_quantity FROM sa`, function(err, results){
                                    if (err){ 
                                            throw err;
                                    }
                               });