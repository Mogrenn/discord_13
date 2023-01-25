import { ChannelType, CommandInteraction, Guild, GuildChannel, GuildTextThreadManager, Snowflake, ThreadChannel } from "discord.js";
import { gameShowPublic, gameShowRoleName, gameShowRolePublic } from "../Common";

export class GameShow {
    private guild: Guild;
    private result: {userId: Snowflake, answer: string}[];
    private acceptingAnswer = false;
    private participantThreads: {userId: Snowflake, thread: ThreadChannel}[] = [];

    constructor(interaction: CommandInteraction) {
        this.guild = interaction.guild;
        const test = this.guild.channels.cache.find(c => c.name === gameShowPublic && (c.type === ChannelType.GuildText));
        
        if (test.type === ChannelType.GuildText) {
            const participants = test.members.map(m => {
                const role = m.roles.cache.find(r => r.name === gameShowRolePublic);
                if (role) {
                    return m
                }
            }).filter(p => p !== undefined);
            
            participants.forEach(async p => {
                const thread = await test.threads.create({
                    name: p.user.username+"-private",
                    type: ChannelType.PrivateThread
                });

                this.participantThreads.push({
                    userId: p.id,
                    thread: thread
                });
            });
            
        }
        
    }

    AcceptQuestions() {
        this.acceptingAnswer = true;
        // setTimeout(() => {
        //     this.acceptingAnswer = false;
        // }, 10 * 1000);
    } 

    async ShowResult() {
        const fields = this.result.map(ans => {
            return {name: this.guild.members.cache.find(member => member.id === ans.userId).user.username, value: ans.answer, inline: true}
        });
        

        //TODO: Send it to channel
        this.result = [];
    }

    async ReceiveAnswer(interaction: CommandInteraction) {
        if (!this.acceptingAnswer) {
            await interaction.reply({"ephemeral": true, "content": "Not Accepting answers"});
            return;
        }
        const userIDs = this.result.map((ans) => ans.userId);

        const ans = interaction.options.get("guess", true);
        if (!ans.value || ans.value === "") {
            await interaction.followUp({"ephemeral": true, "content": "Send a answer you idiota"});
            return;
        }

        if (userIDs.includes(interaction.user.id)) {
            const index = this.result.findIndex(a => a.userId === interaction.user.id);
            this.result[index].answer = ans.value.toString();
        } else {
            this.result.push({userId: interaction.user.id, answer: ans.value.toString()});
        }
    }    
}