import { EmbedBuilder } from "@discordjs/builders";
import { ChannelType, CommandInteraction, Guild, Snowflake, TextChannel, ThreadChannel } from "discord.js";
import { gameShowNameMaster, gameShowPublic, gameShowRolePublic } from "../Common";

export class GameShow {
    private guild: Guild;
    private result: {userId: Snowflake, answer: string}[] = [];
    private acceptingAnswer = false;
    private participantThreads: {userId: Snowflake, thread: ThreadChannel}[] = [];

    constructor(interaction: CommandInteraction) {
        this.guild = interaction.guild;
        const publicChannel = this.guild.channels.cache.find(c => c.name === gameShowPublic && (c.type === ChannelType.GuildText));
        if (publicChannel.type === ChannelType.GuildText) {
            const participants = publicChannel.members.map(m => {
                const role = m.roles.cache.find(r => r.name === gameShowRolePublic);
                if (role) {
                    return m
                }
            }).filter(p => p !== undefined);
            
            participants.forEach(async p => {
                const thread = await publicChannel.threads.create({
                    name: p.user.username+"-private",
                    type: ChannelType.PrivateThread
                });

                this.participantThreads.push({
                    userId: p.id,
                    thread: thread
                });
            });
        }

        interaction.followUp("Game show created, remind users to join threads");
    }

    async GetPrivateThreads() {
        return (this.guild.channels.cache.find(c => c.name === gameShowPublic && (c.type === ChannelType.GuildText)) as TextChannel).threads;
    }

    async SendMessageToThreads(msg: string, exclude?: Snowflake[]) {
        const privateThreads = await this.GetPrivateThreads();
        privateThreads.cache.forEach(async t => await t.send(msg));
        // this.participantThreads.filter(p => exclude.includes(p.userId)).forEach(async t => await t.thread.send(msg));
    }

    async SendEmbedToThreads(embed: EmbedBuilder) {
        const privateThreads = (this.guild.channels.cache.find(c => c.name === gameShowPublic && (c.type === ChannelType.GuildText)) as TextChannel).threads;
        privateThreads.cache.forEach(async t => await t.send({embeds: [embed]}));
        // this.participantThreads.forEach(async t => await t.thread.send({embeds: [embed]}));
    }

    async SendMessageToGameMaster(msg: string) {
        const masterChannel = (this.guild.channels.cache.find(c => c.name === gameShowNameMaster && (c.type === ChannelType.GuildText)) as TextChannel);
        await masterChannel.send(msg);
    }

    async AcceptQuestions(interaction: CommandInteraction) {
        this.acceptingAnswer = true;
        await interaction.followUp({
            content: this.acceptingAnswer ? "Accepting" : "Not Accepting"+" answers"
        });

        await this.SendMessageToThreads(this.acceptingAnswer ? `Voting has started` : `Voting has ended`);
    }

    async ShowResult() {

        if (this.acceptingAnswer) {
            this.acceptingAnswer = false;
            await this.SendMessageToThreads("Voting closed, result showing soon");
        }

        const fields = this.result.map(ans => {
            return {name: this.guild.members.cache.find(member => member.id === ans.userId).user.username, value: ans.answer, inline: true}
        });
        
        const embed = new EmbedBuilder()
            .setColor(0x89CFF0)
            .setTitle("Vote results")
            .addFields(fields);

        await this.SendEmbedToThreads(embed);
        this.result = [];
    }

    async ReceiveAnswer(interaction: CommandInteraction) {
        if (!this.acceptingAnswer) {
            return await interaction.followUp({"ephemeral": true, "content": "Not Accepting answers"});
        }

        const userIndex = this.result.findIndex(u => u.userId === interaction.user.id);
        const val = interaction.options.get('guess', true).value;
        //User has not guessed yet
        if (userIndex === -1) {
            this.result.push({userId: interaction.user.id, answer: val.toString()});
        } else {
            this.result[userIndex].answer = val.toString();
        }

        await this.SendMessageToThreads(`${interaction.user.username} has voted`, [interaction.user.id]);
        await this.SendMessageToGameMaster(`${interaction.user.username} has voted: answer is "${val}"`);
    }    
}