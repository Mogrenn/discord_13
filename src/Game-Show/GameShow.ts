import { Snowflake } from "discord-api-types";
import { CommandInteraction, Guild, GuildChannel, MessageEmbed, ThreadChannel } from "discord.js";
import { gameShowPublic } from "../Common";

export class GameShow {
    private guild: Guild;
    private result: {userId: Snowflake, answer: string}[];
    private acceptingAnswer = false;
    private participantThreads: ThreadChannel[];

    constructor(interaction: CommandInteraction) {
        this.guild = interaction.guild;
        const test = this.guild.channels.cache.find(c => c.name === gameShowPublic && !c.isThread());
        
        
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
        const embed = new MessageEmbed()
        .setTitle("Result from question")
        .addFields(fields);

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