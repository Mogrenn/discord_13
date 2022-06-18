import {CommandInteraction, User} from "discord.js";

export class HigherOrLower {
    private user: User;
    private bet: Number;
    private number = Math.ceil(Math.random()*100)+1;
    private guesses = 3;
    private commandInteraction: CommandInteraction;

    constructor(user: User, bet: Number, interaction: CommandInteraction) {
        this.user = user;
        this.bet = bet;
        this.commandInteraction = interaction;
        this.commandInteraction.followUp({content: "Guess a number between 1 - 100"});
    }

    public async guess(guess: string) {
        const temp = parseInt(guess);
        if (temp === this.number) {
            await  this.commandInteraction.followUp({content: `You guessed to low. You have ${this.guesses} left`});
            return true;
        } else if (this.guesses > 0) {
            this.guesses--;
            if (temp > this.number) {
                await  this.commandInteraction.followUp({content: `You guessed to high. You have ${this.guesses} left`});
            } else {
                await  this.commandInteraction.followUp({content: `You guessed to low. You have ${this.guesses} left`});
            }
        } else {
            await this.commandInteraction.reply({content: `You lost. The number was ${this.number}`});
        }
        return false;
    }
}
