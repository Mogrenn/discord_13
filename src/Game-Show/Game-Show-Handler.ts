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
            await interaction.followUp({ephemeral: true, content: "Game is already started"});
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
            await interaction.followUp({ephemeral: true, content: "You don't have an active game"});
        } else {
            const currentGameShow = this.gameShowSubscriptions.get(interaction.guildId);
            await currentGameShow.ShowResult(interaction);
        }
    }

    async Set100Number(interaction: CommandInteraction) {
        if(!(await this.CheckGameShow(interaction.guildId))) {
            await interaction.followUp({ephemeral: true, content: "You don't have an active game"});
        } else {
            const currentGameShow = this.gameShowSubscriptions.get(interaction.guildId);
            await currentGameShow.SetGameShowNumber(interaction);
        }
    }

    async Show100Result(interaction: CommandInteraction) {
        if(!(await this.CheckGameShow(interaction.guildId))) {
            await interaction.followUp({ephemeral: true, content: "You don't have an active game"});
        } else {
            const currentGameShow = this.gameShowSubscriptions.get(interaction.guildId);
            await currentGameShow.ShowResult100(interaction);
        }
    }

    async Send100Answer(interaction: CommandInteraction) {
        if(!(await this.CheckGameShow(interaction.guildId))) {
            await interaction.followUp({ephemeral: true, content: "You don't have an active game"});
        } else {
            const currentGameShow = this.gameShowSubscriptions.get(interaction.guildId);
            await currentGameShow.Guess100(interaction);
        }
    }

    async Reset100(interaction: CommandInteraction) {
        if(!(await this.CheckGameShow(interaction.guildId))) {
            await interaction.followUp({ephemeral: true, content: "You don't have an active game"});
        } else {
            const currentGameShow = this.gameShowSubscriptions.get(interaction.guildId);
            await currentGameShow.Reset100(interaction);
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

export async function Show100Result(interaction: CommandInteraction) {
    await GameShowSingleton.GetInstance().Show100Result(interaction);
}

export async function Guess100(interaction: CommandInteraction) {
    await GameShowSingleton.GetInstance().Send100Answer(interaction);
}

export async function Reset100(interaction: CommandInteraction) {
    await GameShowSingleton.GetInstance().Reset100(interaction);
}

export async function Set100Number(interaction: CommandInteraction) {
    await GameShowSingleton.GetInstance().Set100Number(interaction);
}

export async function SendResult(interaction: CommandInteraction) {
    await GameShowSingleton.GetInstance().SendResult(interaction);
} 