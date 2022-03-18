const pool = require("../../config/database");

module.exports = {
    create: (data, callBack) => {
        pool.query(
            `insert into users(user_first_name, user_last_name, user_sex, user_username, user_password)
             values (?,?,?,?,?)
            `,
            [
                data.first_name,
                data.last_name,
                data.sex,
                data.username,
                data.password
            ],
            (error, results, fields) => {
                if(error){ 
                   return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },
    getUser: callBack => {
        pool.query(
            `SELECT id, user_first_name, user_last_name, user_sex, user_username from users`, [],
            (error, results, fields) => {
                if(error) {
                    callBack(error);
                }
                return callBack(null, results);
            }
        )
    },
    getUserByUserId: (id, callBack) => {
        pool.query(
            `SELECT id, user_first_name, user_last_name, user_sex, user_username from users where id =? `, [id],
            (error, results, fields) => {
                if(error){
                    callBack(error);
                }
                return callBack(null, results[0]);
            }
        )
    },
    updateUser: (data, callBack) => {
        pool.query(
            `update users set user_first_name = ?, user_last_name = ?, user_sex = ?, user_username = ?, user_password = ?
             where user_id = ?
            `,
            [
                data.first_name,
                data.last_name,
                data.sex,
                data.username,
                data.password,  
                data.id
            ],
            (error, results, fields) => {
                if(error){ 
                   return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },
    deleteUser: (data, callBack) => {
        pool.query(
            `delete from users where user_id = ?`,
            [data.id],
            (error, results, fields) => {
                if(error){ 
                   return callBack(error);
                }
                return callBack(null, results);
            } 
        )
    },
    getUserByUserEmail: (email, callBack) => {
        pool.query(
            `select * from users where user_username = ?`,
            [email],
            (error, results, fields) => {
                if(error){
                    callBack(error);
                }
                return callBack(null, results[0]);
            } 
        );
    }
};