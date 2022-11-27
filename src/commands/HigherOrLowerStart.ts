import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import {StartGame} from "../gamba/higherOrLower/HigherOrLower-handler";
import {getBalance, hasAssets} from "../functions/economy-handler";

const command = {
    data: new SlashCommandBuilder()
        .setName("higherorlower")
        .setDescription("Starts a higher or lower game")
        .addNumberOption(option =>
            option.setName("bet")
                .setDescription("How much to bet")
                .setRequired(true)
        ),
    async execute(interaction: CommandInteraction) {
        await interaction.deferReply();
        const bet = (await interaction.options.get("bet").value as number)??0;
        if (await hasAssets(interaction.member.user.id, bet)) {
            await StartGame(interaction);
        } else {
            const balance = await getBalance(interaction.member.user.id);
            await interaction.followUp({content: `You don have enough, your balance is ${balance}`, ephemeral: true});
        }
    },
};

export const Command = command;
