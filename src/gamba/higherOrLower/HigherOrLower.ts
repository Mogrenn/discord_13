import {CommandInteraction, User} from "discord.js";
import {addTransaction} from "../../functions/economy-handler";

export class HigherOrLower {
    private user: User;
    private readonly bet: number;
    private firstNumber = this.GetNumber();
    private commandInteraction: CommandInteraction;

    constructor(user: User, bet: number, interaction: CommandInteraction) {
        this.user = user;
        this.bet = bet;
        this.commandInteraction = interaction;
        this.commandInteraction.followUp({content: `Higher or lower than ${this.firstNumber}`});
    }

    public async guess(guess: string) {
        const number2 = this.GetNumber();
        let won = false;
        if (guess === "higher" && number2 > this.firstNumber || guess === "lower" &&number2 < this.firstNumber) {
            await this.commandInteraction.followUp({content: "You won. The number is "+number2});
            won = true;
        } else {
            await this.commandInteraction.followUp({content: `You lost, the number was ${number2}`});
        }

        await addTransaction(this.user.id, won ? this.bet : this.bet * -1);

    }

    private GetNumber() {
        if (this.firstNumber === undefined) return Math.ceil(Math.random()*100)+1;

        const number = Math.ceil(Math.random()*100)+1;
        if (number === this.firstNumber) {
            return this.GetNumber();
        }

        return number;
    }
}
