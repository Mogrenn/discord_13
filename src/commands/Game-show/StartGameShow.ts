import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember } from "discord.js";
import { gameShowRoleName } from "../../Common";
import { HasGuildRole } from "../../Common/discord-functions/Check-Discord-Role";
import { CreateGameShow } from "../../Game-Show";

const command = {
    data: new SlashCommandBuilder()
        .setName("startgameshow")
        .setDescription("Sends a guess to game-master-channel")
        .addStringOption(option =>
            option.setName("name")
                .setDescription("What is then name of the gameshow")
                .setRequired(true)
        ),
    async execute(interaction: CommandInteraction) {
        console.log(interaction.member.roles);
        console.log(gameShowRoleName);
        
        // console.log(await HasGuildRole(interaction.member as GuildMember, gameShowRoleName));
        
        
        if (!(await HasGuildRole(interaction.member as GuildMember, gameShowRoleName))) {
            await interaction.reply({ephemeral: true, content: `Only ${gameShowRoleName} have access to this command`});
            return;
        }
        await interaction.deferReply();
        await CreateGameShow(interaction);
    },
};

export const Command = command;
