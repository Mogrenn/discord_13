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

    async Init(instance: DBConnection, retries = 3) {
        try {
            instance.conn = await maria.createConnection({host: process.env.HOST, user: process.env.USER, password: process.env.PASSWORD, database: process.env.DATABASE});
        } catch (e) {
            if (retries > 0) {
                this.Init(instance, retries--);
            } else {
                console.log("Could not connect to db");
                process.exit(1);
            }
        }
    }

    async Query<T>(sql: string): Promise<{success: boolean, data?: T, error?: string}> {
        try {
            let res = await DBConnection.GetInstance().conn.query(sql);
            return {success: true, data: res}
        } catch(e) {
            return {success: false, error: "Could not connect to the database"}
        }
    }

    async QueryTransaction() {

    }

    async ExecuteTransaction(con: maria.Connection, query: () => void) {
        await con.beginTransaction();

        try {
            query();
            await con.commit();
        } catch(e) {
            console.log(e);
            await con.rollback();
        }
    }
}

export const Test = () => {
    DBConnection.GetInstance();
}

export const Query = <T>(sql: string): Promise<{success: boolean, data?: T, error?: string}> => {
    return DBConnection.GetInstance().Query<T>(sql);
}
