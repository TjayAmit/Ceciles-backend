CREATE DATABASE cecilesdatabase;

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
    unit VARCHAR(50) NOT NULL,
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

CREATE TABLE allocations(
    allocation_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    allocation_branch VARCHAR(50) NOT NULL,
    allocation_date DATE NOT NULL DEFAULT CURRENT_DATE(),
    product_id  VARCHAR(50) NOT NULL,
    product_name VARCHAR(50) NOT NULL,
    quantity_given VARCHAR(50) NOT NULL
);


CREATE TABLE inventories(
    inventory_branch VARCHAR(50) NOT NULL,
    inventory_date DATE NOT NULL DEFAULT CURRENT_DATE(),
    product_id  VARCHAR(50) NOT NULL,
    product_name VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL
);

CREATE TABLE branches(
    branch_name VARCHAR(50) NOT NULL,
    branch_warehouse_name VARCHAR(50) NOT NULL,
    branch_keyword VARCHAR(50) NOT NULL,
);

CREATE TABLE suggestedAllocation(
    branch VARCHAR(50) NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    product_name VARCHAR(50) NOT NULL,
    available_inventory INTEGER NOT NULL,
    sold_quantity INTEGER NOT NULL,
    suggested_allocation_quantity INTEGER NOT NULL,
    allocation_date DATE NOT NULL DEFAULT CURRENT_DATE()
);

CREATE TABLE distrubution(
    branch VARCHAR(50) NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    product_name VARCHAR(50) NOT NULL,
    available_inventory INTEGER NOT NULL,
    distribution_quantity INTEGER NOT NULL,
    distribution_date DATE NOT NULL DEFAULT CURRENT_DATE()
);

CREATE TABLE settings (
    settings_id INTEGER PRIMARY KEY, 
    bump FLOAT NOT NULL DEFAULT 0,
    priority_branch1 FLOAT NOT NULL DEFAULT 0,
    priority_branch2 FLOAT NOT NULL DEFAULT 0,
    priority_branch3 FLOAT NOT NULL DEFAULT 0
);

INSERT INTO `settings`(`settings_id`, `bump`, `priority_branch1`, `priority_branch2`, `priority_branch3`) VALUES (1,0,0,0,0);

DELIMITER $$ 

DROP FUNCTION IF EXISTS `inventoryBranch`$$
CREATE FUNCTION `inventoryBranch`(in_string varchar(50)) 
RETURNS varchar(50)

BEGIN
	DECLARE invetory_branch varchar(50);
    CASE
        WHEN (in_string = "ALANO 2018" OR in_string = "In transit Alano 2018") THEN SET invetory_branch = "ALANO";
        WHEN (in_string = "CAWA CAWA 2019" OR in_string = "In Transit Cawa-Cawa 2019") THEN SET invetory_branch = "CAWA";
        WHEN (in_string = "CITI MART" OR in_string = "In transit CITI MART") THEN SET invetory_branch = "CITIMART";
        WHEN (in_string = "GUSU 2018" OR in_string = "In Transit GUSU 2018") THEN SET invetory_branch = "GUSU";
        WHEN (in_string = "STA CATALINA 2019" OR in_string = "In Transit Sta Catalina 2019") THEN SET invetory_branch = "STA CATALINA";
        WHEN (in_string = "CPCS TUMAGA 2  2021" OR in_string = "In Transit Tumaga 2  2021") THEN SET invetory_branch = "TUMAGA";
        WHEN (in_string = "DIVISORIA 2019" OR in_string = "In Transit Divisoria 2019") THEN SET invetory_branch = "DIVISORIA";
        WHEN (in_string = "GUIWAN TERMINAL 2017" OR in_string = "IN TRANSIT GUIWAN TERMINAL 2017") THEN SET invetory_branch = "GUIWAN - TERMINAL";
        WHEN (in_string = "GUIWAN OLD 2019" OR in_string = "In Transit Guiwan Old 2019") THEN SET invetory_branch = "GUIWAN - OLD";
        WHEN (in_string = "STA MARIA 1 2019" OR in_string = "In transit Sta Maria 1 2019") THEN SET invetory_branch = "STA MARIA 1";
        WHEN (in_string = "STA MARIA 2 2019" OR in_string = "In transit Sta Maria 2 2019") THEN SET invetory_branch = "STA MARIA 2";
        WHEN (in_string = "VET 2" OR in_string = "IN TRANSIT VETERANS 2") THEN SET invetory_branch = "NEW VETERANS 2";
        WHEN (in_string = "SAN JOSE MAIN 2019" OR in_string = "In Transit San Jose 2019") THEN SET invetory_branch = "SAN JOSE";
        WHEN (in_string = "SAN ROQUE 2019" OR in_string = "In Transit San Roque 2019") THEN SET invetory_branch = "SAN ROQUE";
        WHEN (in_string = "Tetuan 2018" OR in_string = "In transit Tetuan 2018") THEN SET invetory_branch = "TETUAN";
        WHEN (in_string = "Tetuan Yubenco 2017" OR in_string = "In transit Tetuan Yubenco 2017") THEN SET invetory_branch = "TETUAN YUBENCO";
        WHEN (in_string = "Sta Cruz 2019" OR in_string = "IN TRANSIT STA CRUZ 2019") THEN SET invetory_branch = "STACRUZ";
        WHEN (in_string = "Talon-talon 2018" OR in_string = "In Transit Talon-talon 2018") THEN SET invetory_branch = "TALON TALON";
        WHEN (in_string = "SCC WEST GUSU 2019" OR in_string = "In Transit SCC West Gusu 2019") THEN SET invetory_branch = "WEST GUSU";
        WHEN (in_string = "Tugbungan 2018" OR in_string = "In Transit Tugbungan 2018") THEN SET invetory_branch = "TUGBUNGAN";
        WHEN (in_string = "IPIL" OR in_string = "IPIL STOCK ROOM STORAGE WAREHOUSE" OR in_string = "IN TRANSIT IPIL") THEN SET invetory_branch = "IPIL";
        ELSE SET invetory_branch = in_string;
    END CASE;
    RETURN invetory_branch;
END;
$$

DELIMITER ;



/*--------------------------------------------------------- END*/





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


/* PRIORTIRY QUERY */
SELECT * FROM product_offtakes WHERE product_name = "ALAXAN FR CAP" and branch in (SELECT branch_name FROM branches) ORDER by sold_quantity DESC LIMIT 3;