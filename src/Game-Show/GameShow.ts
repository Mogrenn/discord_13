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

        if (userIndex === -1) {
            this.roundResult.push({userId: interaction.user.id, guess: val as number});
            const currentUserIndex = this.roundResult.findIndex(rr => rr.userId === interaction.user.id);
            const overallUserIndex = this.overallResult.findIndex(oR => oR.userId === interaction.user.id);

            let diff = Math.abs(this.currentNumber - (val as number));

            const bonus = await this.GetRoundBonus(currentUserIndex);
            diff -= bonus;

            if (overallUserIndex === -1) {
                this.overallResult.push({userId: interaction.user.id, score: diff});
            } else {
                this.overallResult[overallUserIndex].score += diff;
            }

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
        
        const embed = new EmbedBuilder()
        .setColor(0x89CFF0)
        .setTitle("Overall result")
        .setDescription(`Correct answer was ${this.currentNumber}`)

        this.overallResult = this.overallResult.sort((a, b) => a.score - b.score);

        await Promise.all(this.overallResult.map(async oR => {
            const currentUserIndex = this.roundResult.findIndex(rr => rr.userId === oR.userId);
            
            const bonusScore = await this.GetRoundBonus(currentUserIndex);
            embed.addFields(
                {name: "User", value: this.guild.members.cache.find(member => member.id === oR.userId).user.username, inline: true},
                {name: "Overall score", value: oR.score.toString(), inline: true},
                {name: '\u200B', value: '\u200B'} //Empty space
            )

            embed.addFields(
                {name: "Round guess", value: this.roundResult[currentUserIndex].guess.toString(), inline: true},
            )

            if (bonusScore > 0) {
                embed.addFields(
                    {name: "Bonus", value: bonusScore.toString(), inline: true},
                )
            }
            embed.addFields(
                {name: '\u200B', value: '-----------------'} //Empty space
            )
        }));
             
        this.currentNumber = undefined;
        this.roundResult = [];

        await this.SendEmbedToThreads(embed);
        await interaction.followUp({embeds: [embed]});
    }

    private async GetRoundBonus(userIndex: number): Promise<number> {

        switch (userIndex) {
            case 0:
                return 20;
            case 1:
                return 10;
            case 2:
                return 5;
            default:
                return 0
        }
    }
    
    async SetGameShowNumber(interaction: CommandInteraction) {
        if (this.currentNumber) {
            return await interaction.followUp("game mode alredy started");
        }
        
        const val = interaction.options.get('number', true).value;
        this.currentNumber = val as number;
        await this.SendMessageToThreads(`Guess between 0-100 digit number, Use command /guess100`);
        await interaction.followUp("Game Started");
    }

    async Reset100(interaction: CommandInteraction) {
        this.currentNumber = undefined;
        this.roundResult = [];
        this.overallResult = [];

        await interaction.followUp("100 has been hard resetted");
    }
}