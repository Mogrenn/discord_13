import {HigherOrLower} from "./HigherOrLower";
import {CommandInteraction, Snowflake} from "discord.js";

const currentGames = new Map<Snowflake, HigherOrLower>();

export async function StartGame(interaction: CommandInteraction) {
    const user = interaction.user;


    if (!currentGames.has(user.id)) {
        const game = currentGames.get(user.id);
        const res = await game.guess("");
        if (res) {

        }
    } else {
        currentGames.set(user.id, new HigherOrLower(user, 100, interaction));
    }
}
