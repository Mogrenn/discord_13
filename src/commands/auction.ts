import { Guild, Interaction, TextChannel, User } from "discord.js";

export class Auction {

    private guild: Guild;
    private auctioner: User;
    private auctionChannel: TextChannel;
    private slaves: {userId: string, userName: string}[];
    private buyers: string[];
    private currentSlaveToSale: {userId: string, currentBid: number, currentLeader: {userId: string, userName: string}};

    constructor(interaction: Interaction) {
        this.guild = interaction.guild;
        this.auctioner = interaction.member.user as User;
    }

    Init() {
        
    }

    SendMessage(msg: string) {
        this.auctionChannel.send(msg);
    }

    GetAllSlaves() {
        this.slaves = this.guild.members.cache.map(u => {
            if (u.roles.cache.some(r => r.name === "Slave")) {
                return {userId: u.user.id, userName: u.user.username};
            }
        });
    }

    GetBiders(minRole: string) {
        let minimumRolePosition = this.guild.roles.cache.find(r => r.name === minRole).position;
        this.buyers = this.guild.members.cache.map(u => {
            if (u.roles.cache.some(r => r.position >= minimumRolePosition)) {
                return u.user.id;
            }
        });
    }
    
    VerifyFunds(userId: string, bid: number): boolean {

        return false;
    }

    public Bid(user: User, bid: number) {
        if (!this.buyers.includes(user.id)) this.SendMessage(`${user.username} are not allowed to bid`);
        if (!this.VerifyFunds(user.id, bid)) this.SendMessage(`${user.username} you dont have that kind of money`);
        if (this.currentSlaveToSale.currentBid > bid) this.SendMessage(`${user.username} your bid is to low. Current bid is ${this.currentSlaveToSale.currentBid}`);

        this.currentSlaveToSale = {...this.currentSlaveToSale, currentBid: bid, currentLeader: {userId: user.id, userName: user.username}};
        this.SendMessage(`Current leader is ${user.username} with a bid of ${bid}`);
    }

    public GetSlaves(user: User) {
        if (user !== this.auctioner) this.SendMessage(`${user.username} your are not the auctioner and thus cant use that command`);
        let message = "";
        this.slaves.forEach((u, i) => {
            if (i === this.slaves.length) message +=  `id: ${i} username: ${u.userName}`;
            else message += `id: ${i} username: ${u.userName}\n`;
        });
        this.SendMessage(message);
    }

    public NextSlave(user: User, nextSlave: number) {
        if (user !== this.auctioner) this.SendMessage(`${user.username} your are not the auctioner and thus cant use that command`);
        if (nextSlave > this.slaves.length) this.SendMessage(`${user.username} the number you chose is to high use /GetSlaves to see which are available`);
        const slave = this.slaves[nextSlave];
        this.currentSlaveToSale = {userId: slave.userId, currentBid: 0, currentLeader: {userId: "", userName: ""}};
        this.SendMessage(`New auction has began, the user is ${slave.userName}. Happy buying`);
    }
}