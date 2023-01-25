import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMemberRoleManager } from "discord.js";
import { gameShowRoleName } from "../../Common";
import config from "../../../config";

const command = {
    data: new SlashCommandBuilder()
        .setName("start")
        .setDescription("Sends a guess to game-master-channel")
        .addStringOption(option =>
            option.setName("name")
                .setDescription("What is then name of the gameshow")
                .setRequired(true)
        ),
    async execute(interaction: CommandInteraction) {
        
        if (!config.ActiveModules.GameShow.Active || !config.ActiveModules.GameShow.Servers.includes(interaction.guildId)) {
            await interaction.reply({"ephemeral": true, "content": "Command has been disabled or is server is not included!"});
            return;
        }

        if (!(interaction.member.roles as GuildMemberRoleManager).cache.find(role => role.name === gameShowRoleName)) {
            await interaction.reply({"ephemeral": true, "content": "FUCK OFF YOU IDIOT GET A ROLE FIRST"});
            return;
        }
        await interaction.deferReply();
        

    },
};

export const Command = command;
