import { CommandInteraction, Snowflake } from "discord.js";
import { GameShow } from "./GameShow";

class GameShowSingleton {
    static instance: GameShowSingleton;
    private gameShowSubscriptions = new Map<Snowflake, GameShow>()

    static GetInstance() {
        if (!GameShowSingleton.instance)
            GameShowSingleton.instance = new GameShowSingleton();

        return GameShowSingleton.instance;
    }

    async CheckGameShow(guildId: Snowflake) {
        return this.gameShowSubscriptions.has(guildId);
    }

    async CreateGameShow(interaction: CommandInteraction) {
        if (await this.CheckGameShow(interaction.guildId)) {
            await interaction.reply({ephemeral: true, content: "Game is already started"});
            return;
        }

        this.gameShowSubscriptions.set(interaction.guildId, new GameShow(interaction));
    }

    async AcceptAnswers(interaction: CommandInteraction) {
        if (!(await this.CheckGameShow(interaction.guildId))) {
            await interaction.followUp({ephemeral: true, content: "You don't have an active game"});
        } else {
            const currentGameShow = this.gameShowSubscriptions.get(interaction.guildId);
            await currentGameShow.AcceptQuestions(interaction);
        }
    }

    async ReceiveAnswer(interaction: CommandInteraction) {
        if (!(await this.CheckGameShow(interaction.guildId))) {
            await interaction.followUp({ephemeral: true, content: "There is no active game"});
        } else {
            const currentGameShow = this.gameShowSubscriptions.get(interaction.guildId);
            await currentGameShow.ReceiveAnswer(interaction);
        }
    }

    async SendResult(interaction: CommandInteraction) {
        if (!(await this.CheckGameShow(interaction.guildId))) {
            await interaction.reply({ephemeral: true, content: "You don't have an active game"});
        } else {
            const currentGameShow = this.gameShowSubscriptions.get(interaction.guildId);
            await currentGameShow.ShowResult();
        }
    }
}

export async function CreateGameShow(interaction: CommandInteraction) {
    await GameShowSingleton.GetInstance().CreateGameShow(interaction);
}

export async function ToggleAcceptAnswer(interaction: CommandInteraction) {
    await GameShowSingleton.GetInstance().AcceptAnswers(interaction);
}

export async function SendAnswer(interaction: CommandInteraction) {
    await GameShowSingleton.GetInstance().ReceiveAnswer(interaction);
}

export async function SendResult(interaction: CommandInteraction) {
    await GameShowSingleton.GetInstance().SendResult(interaction);
}