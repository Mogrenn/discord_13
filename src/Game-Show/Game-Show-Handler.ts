import { Snowflake } from "discord-api-types";
import { CommandInteraction } from "discord.js";
import { GameShow } from "./GameShow";

class GameShowSingleton {
    static instance: GameShowSingleton;
    gameShowSubscriptions = new Map<Snowflake, GameShow>()

    static GetInstance() {
        if (!GameShowSingleton.instance)
            GameShowSingleton.instance = new GameShowSingleton();

        return GameShowSingleton.instance;
    }

    async CheckGameShow(guildId: Snowflake) {
        return this.gameShowSubscriptions.has(guildId);
    }

    async CreateGameShow(interaction: CommandInteraction) {
        if (this.gameShowSubscriptions.has(interaction.guildId)) {
            await interaction.reply({ephemeral: true, content: "Game is already started"});
            return;
        }

        this.gameShowSubscriptions.set(interaction.guildId, new GameShow(interaction));
    }

    async AcceptAnswers(interaction: CommandInteraction) {
        if (this.CheckGameShow(interaction.guildId)) {
            await interaction.reply({ephemeral: true, content: "You don't have an active game"});
        } else {
            const currentGameShow = this.gameShowSubscriptions.get(interaction.guildId);
            currentGameShow.AcceptQuestions();
        }
    }

    async ReceiveAnswer(interaction: CommandInteraction) {
        if (this.CheckGameShow(interaction.guildId)) {
            await interaction.reply({ephemeral: true, content: "There is no active game"});
        } else {
            
        }
    }

    async SendResult(interaction: CommandInteraction) {
        if (this.CheckGameShow(interaction.guildId)) {
            await interaction.reply({ephemeral: true, content: "You don't have an active game"});
        } else {
            const currentGameShow = this.gameShowSubscriptions.get(interaction.guildId);
            currentGameShow.ShowResult();
        }
    }
}

export async function CreateGameShow(interaction: CommandInteraction) {
    await GameShowSingleton.GetInstance().CreateGameShow(interaction);
}