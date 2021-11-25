import * as maria from "mariadb";
require("dotenv").config({path: ".env"});


class DBConnection {
    private conn: maria.Connection;
    private static instance: DBConnection;

    constructor(){
        this.Init(this);
    };

    public static GetInstance() {

        if (!DBConnection.instance) {
            DBConnection.instance = new DBConnection();
        }

        return DBConnection.instance;
    }

    async Init(instance: DBConnection) {
        console.log("hej")
        instance.conn = await maria.createConnection({host: process.env.HOST, user: process.env.USER, password: process.env.PASSWORD, database: process.env.DATABASE});
    }

    async Query(sql: string) {
        console.log(DBConnection.GetInstance().conn)
        let res = await DBConnection.GetInstance().conn.query(sql);
        return res;
    }

    async QueryTransaction() {

    }

    async ExecuteTransaciton() {
        
    }
}

export const Test = () => {
    DBConnection.GetInstance();
}

export const Query = (sql: string) => {
    //return DBConnection.GetInstance().Query(sql);
}