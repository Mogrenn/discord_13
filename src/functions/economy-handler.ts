import {Snowflake} from "discord.js";
import {Query} from "../Database/database-connection";

export async function getBalance(userId: Snowflake): Promise<number> {
    const res = await Query<number>(`
    
    `);

    return res.data??0
}

export async function hasAssets(userId: Snowflake, request: number): Promise<boolean> {
    if (request === 0) return false;
    return await getBalance(userId) >= request;
}

export async function addTransaction(userId: Snowflake, balanceChange: number) {

}
