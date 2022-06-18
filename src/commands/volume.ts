import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember } from "discord.js";
import { Volume } from "../music/music-handler";

const command = {
    data: new SlashCommandBuilder()
        .setName("volume")
        .setDescription("Change the volume")
        .addNumberOption(option =>
            option.setName("newvolume")
            .setDescription("The new volume")
            .setRequired(true)
        ),
    async execute(interaction: CommandInteraction) {
        await interaction.deferReply();

        if (!(interaction.member instanceof GuildMember /*&& interaction.member.roles.cache.some(role => role.name === "bot-commander")*/)) {
            await interaction.followUp({content: "You dont have access to this command", ephemeral: true});
            return;
        }

        if (interaction.member.voice.channel) {
            Volume(interaction.guildId, interaction);
        } else {
            await interaction.followUp({content: "You need to connect to a voice channel", ephemeral: true});
        }
    },
};

export const Command = command;
