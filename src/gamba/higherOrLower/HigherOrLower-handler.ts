import {HigherOrLower} from "./HigherOrLower";
import {CommandInteraction, Snowflake} from "discord.js";

const currentGames = new Map<Snowflake, HigherOrLower>();

export async function StartGame(interaction: CommandInteraction) {
    const user = interaction.user;
    currentGames.set(user.id, new HigherOrLower(user, await interaction.options.get("bet")!.value! as number, interaction));
}

export async function Guess(interaction: CommandInteraction, guess: string) {
    const user = interaction.user;

    if (!currentGames.has(user.id)) {
        await interaction.followUp({content: "You need to start a game"});
    } else {
        const game = currentGames.get(user.id);
        await game.guess(guess);
        currentGames.delete(user.id);
    }
}
