import { EmbedBuilder } from "@discordjs/builders";
import { ChannelType, CommandInteraction, Guild, Snowflake, TextChannel, ThreadChannel } from "discord.js";
import { gameShowNameMaster, gameShowPublic, gameShowRolePublic } from "../Common";

export class GameShow {
    private guild: Guild;
    private guessResult: {userId: Snowflake, answer: string}[] = [];
    private acceptingAnswer = false;
    private participantThreads: {userId: Snowflake, thread: ThreadChannel}[] = [];
    private currentNumber: number;
    private roundResult: {userId: Snowflake, guess: number}[] = [];
    private overallResult: {userId: Snowflake, score: number}[] = [];

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

    private async GetPrivateThreads() {
        return (this.guild.channels.cache.find(c => c.name === gameShowPublic && (c.type === ChannelType.GuildText)) as TextChannel).threads;
    }

    private async SendMessageToThreads(msg: string, exclude?: Snowflake[]) {
        const privateThreads = await this.GetPrivateThreads();
        privateThreads.cache.forEach(async t => await t.send(msg));
        // this.participantThreads.filter(p => exclude.includes(p.userId)).forEach(async t => await t.thread.send(msg));
    }

    private async SendEmbedToThreads(embed: EmbedBuilder) {
        const privateThreads = (this.guild.channels.cache.find(c => c.name === gameShowPublic && (c.type === ChannelType.GuildText)) as TextChannel).threads;
        privateThreads.cache.forEach(async t => await t.send({embeds: [embed]}));
        // this.participantThreads.forEach(async t => await t.thread.send({embeds: [embed]}));
    }

    private async SendMessageToGameMaster(msg: string) {
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

    async ShowResult(interaction: CommandInteraction) {

        if (this.acceptingAnswer) {
            this.acceptingAnswer = false;
            await this.SendMessageToThreads("Voting closed, result showing soon");
        }

        const fields = this.guessResult.map(ans => {
            return {name: this.guild.members.cache.find(member => member.id === ans.userId).user.username, value: ans.answer, inline: true}
        });
        
        const embed = new EmbedBuilder()
            .setColor(0x89CFF0)
            .setTitle("Vote results")
            .addFields(fields);

        await this.SendEmbedToThreads(embed);
        await interaction.followUp({embeds: [embed]});
        this.guessResult = [];
    }

    async ReceiveAnswer(interaction: CommandInteraction) {
        if (!this.acceptingAnswer) {
            return await interaction.followUp({"ephemeral": true, "content": "Not Accepting answers"});
        }

        const userIndex = this.guessResult.findIndex(u => u.userId === interaction.user.id);
        const val = interaction.options.get('guess', true).value;
        //User has not guessed yet
        if (userIndex === -1) {
            this.guessResult.push({userId: interaction.user.id, answer: val.toString()});
        } else {
            this.guessResult[userIndex].answer = val.toString();
        }

        await this.SendMessageToThreads(`${interaction.user.username} has guessed`, [interaction.user.id]);
        await this.SendMessageToGameMaster(`${interaction.user.username} has guessed: "${val}"`);
    }

    async Guess100(interaction: CommandInteraction) {
        if (!this.currentNumber) {
            return;
        }

        const userIndex = this.roundResult.findIndex(u => u.userId === interaction.user.id);
        const val = interaction.options.get('guess', true).value;

        if (userIndex > -1) {
            this.roundResult.push({userId: interaction.user.id, guess: val as number});
            await this.SendMessageToThreads(`${interaction.user.username} has guessed`, [interaction.user.id]);
            await this.SendMessageToGameMaster(`${interaction.user.username} has guessed: "${val}"`);
        } else {
            await interaction.followUp({ephemeral: true, content: "Already answered"});
        }
    }

    async ShowResult100(interaction: CommandInteraction) {
        if (!this.currentNumber) {
            return;
        }

        this.roundResult.forEach(rs => {
            const diff = Math.max(this.currentNumber - rs.guess);
            const userIndex = this.roundResult.findIndex(u => u.userId === rs.userId);
            
            if (userIndex > -1) {
                this.overallResult.push({userId: rs.userId, score: diff});
            } else {
                this.overallResult[userIndex].score += diff;
            }
        });

        const fields = this.overallResult.map(ans => {
            return {name: this.guild.members.cache.find(member => member.id === ans.userId).user.username, value: ans.score.toString(), inline: true}
        }).sort((a, b) => parseInt(a.value) - parseInt(b.value));
        
        const embed = new EmbedBuilder()
            .setColor(0x89CFF0)
            .setTitle("Overall result")
            .addFields(fields);

        this.currentNumber = undefined;
        this.roundResult = [];

        await this.SendEmbedToThreads(embed);
        await interaction.followUp({embeds: [embed]});
    }
    
    async SetGameShowNumber(interaction: CommandInteraction) {
        if (this.currentNumber) {
            return await interaction.reply("game mode alredy started");
        }
        
        const val = interaction.options.get('number', true).value;
        this.currentNumber = val as number;
        await this.SendMessageToThreads(`Guess a 2 digit number`);
        await interaction.reply("Game Started");
    }

    async Reset100(interaction: CommandInteraction) {
        this.currentNumber = undefined;
        this.roundResult = [];
        this.overallResult = [];

        await interaction.followUp("100 has been hard resetted");
    }
}