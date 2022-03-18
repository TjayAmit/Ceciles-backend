const { 
    create,
    getUser,
    getUserByUserId,
    updateUser,
    deleteUser,
    getUserByUserEmail
 } = require("./user.service");

const { genSaltSync, hashSync, compareSync} = require("bcrypt");
const { sign } = require("jsonwebtoken");

module.exports = {
    createUser: (req, res) => {
        const body = req.body;
        const salt = genSaltSync(10);
        body.password = hashSync(body.password, salt);
        create(body, (err, results) => {
            if(err) {
                console.log(err);
                return res.status(500).json({
                    success: 0,
                    message: "Database connection error",
                });
            }
            return res.status(200).json({
                success: 1,
                data: results,
            });
        });
    },
    getUser: (req, res) => {
        getUser((err, result) =>{
            if(err){
                console.log(err);
                return;
            }
            return res.json({
                success: 1,
                data: result
            });
        });
    },
    getUserByUserId: (req, res) => {
        const id = req.params.id;
        getUserByUserId(id, (err, results) =>{
            if(err){
                console.log(err);
                return;
            }   
            if(!results){
                return res.jason({
                    success: 0,
                    message: "User not Found"
                });
            }
            return res.json({
                success: 1,
                data: results
            });
        })
    },
    updateUser: (req, res) => {
        const body = req.body;
        const salt = genSaltSync(10);
        body.password = hashSync(body.password, salt);
        updateUser(body, (err, result) => {
            if(err){
                console.log(err);
                return;
            }
            if(!result){
                return res.json({
                    success: 0,
                    message: "Failed to update users"
                });
            }
            return res.json({
                success: 1,
                message: "updated successfully"
            });
        });
    },
    deleteUser: (req, res) => {
        const data = req.body;
        
        getUserByUserId(data.id, (err, result) =>{
            if(err){
                console.log(err);
                return;
            }   
            if(!result){
                return res.json({
                    success: 0,
                    message: "User does not exist"
                });
            }
            deleteUser(data, (err, _) => {
                if(err){
                    console.log(err);
                    return;
                }
                return res.json({
                    success: 1,
                    message: "User deleted successfully"
                });
            });

        });

    },
    login:(req,res) => {
        const body = req.body;
        console.log(body);
        getUserByUserEmail(body.email, (err, results) => {
            if(err){
                console.log(err);
            }
            if(!results){
                return res.json({
                    success: 0,
                    message: "Invalid email or password"
                });
            } 
            const result = compareSync(body.password, results.user_password);
            if(result){
                results.password = undefined;
                const jsontoken = sign({ result: results}, "jtkj09162021", { expiresIn: "1h" });
                return res.json({
                    success: 1,
                    message: "login successfully",
                    token: jsontoken
                });
            } else {
                return res.json({
                    success: 0,
                    data: "Invalid email or password"
                });
            }
        });
    }
}