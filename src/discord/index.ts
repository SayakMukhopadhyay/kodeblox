/*
 * Copyright 2021 Sayak Mukhopadhyay
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Client, ClientOptions, DMChannel, Message, MessageReaction } from 'discord.js';
import { LoggingClient } from '../logging';
import { Command, NewCommand } from './command';
import { Responses } from './responseDict';
import { Help, HelpSchema } from './commands/help';
import { Hi } from './commands/hi';
import { MyGuild } from './commands/myGuild';

export type DiscordOptions = {
  token: string;
  client: ClientOptions;
};

export class DiscordClient {
  public client: Client;
  public commandsMap: Map<string, Command>;
  private readonly token;

  constructor(options: DiscordOptions) {
    this.client = new Client(options.client);
    this.commandsMap = new Map();
    this.token = options.token;
  }

  public async login(): Promise<string> {
    const discordLogin = await this.client.login(this.token);
    this.listen();
    return discordLogin;
  }

  private listen() {
    this.client.on('ready', () => {
      LoggingClient.log('I am ready!', null, 'console');
      this.registerCommands([[Help], [Hi], [MyGuild]]);
      this.createHelp();
    });

    this.client.on('messageCreate', async (message: Message) => {
      if (message.channel.type === 'DM' && !message.author.bot) {
        this.processDm(message);
      } else if (
        message.mentions.users.filter((user) => {
          return user.id === this.client.user?.id;
        }).size > 0
      ) {
        try {
          this.processNormal(message);
        } catch (err) {
          message.channel.send(Responses.getResponse(Responses.FAIL));
          LoggingClient.log(err);
        }
      }
    });

    this.client.on('messageReactionAdd', (messageReaction, user) => {
      const helpObject = this.commandsMap.get('help') as Help;
      const message = messageReaction.message;
      if (!user.bot && message.embeds && message.embeds.length > 0 && message.embeds[0].title === helpObject.title) {
        helpObject.emojiCaught(messageReaction as MessageReaction);
      }
    });

    this.client.on('raw', async (packet) => {
      if (['MESSAGE_REACTION_ADD'].includes(packet.t)) {
        const channel: DMChannel = (await this.client.channels.fetch(packet.d.channel_id)) as DMChannel;
        if (!channel.messages.cache.has(packet.d.message_id)) {
          const message = await channel.messages.fetch(packet.d.message_id);
          const emoji: string = packet.d.emoji.id ? `${packet.d.emoji.name}:${packet.d.emoji.id}` : packet.d.emoji.name;
          const reaction = message.reactions.cache.get(emoji);
          const user = await this.client.users.fetch(packet.d.user_id);
          this.client.emit('messageReactionAdd', reaction as MessageReaction, user);
        }
      }
    });

    this.client.on('rateLimit', (rateLimitInfo) => {
      LoggingClient.log(new Error('Discord Rate Limit Hit'), {
        metaData: rateLimitInfo
      });
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public registerCommands(commandSets: [command: NewCommand, ...args: any[]][]): void {
    commandSets.forEach((commandSet) => {
      this.registerCommand(commandSet[0], commandSet.slice(1));
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public registerCommand(command: NewCommand, ...constructorArgs: any[]): void {
    const commandInstance = new command(constructorArgs);
    commandInstance.calls.forEach((call) => {
      this.commandsMap.set(call, commandInstance);
    });
    if (commandInstance.sendDm) {
      const dmCommandInstance = new command(true, constructorArgs);
      dmCommandInstance.dmCalls.forEach((call) => {
        this.commandsMap.set(call, dmCommandInstance);
      });
    }
  }

  private createHelp(): void {
    this.commandsMap.forEach((value) => {
      const helpArray: [string, string, string, string[]] = value.help();
      const helpObject: HelpSchema = {
        command: helpArray[0],
        helpMessage: helpArray[1],
        template: helpArray[2],
        example: helpArray[3]
      };
      (this.commandsMap.get('help') as Help).addHelp(helpObject);
    });
  }

  private getCommandArguments(message: Message) {
    if (this.client.user) {
      const messageString = message.content.replace(new RegExp(`<@!?${this.client.user.id}>`), '').trim();
      const messageArray = messageString.split(' ');
      const command = messageArray[0].toLowerCase();
      let commandArguments = '';
      if (messageArray.length > 1) {
        commandArguments = messageArray.slice(1, messageArray.length).join(' ');
      }
      let argsArray: string[] = [];
      if (commandArguments.length !== 0) {
        argsArray = commandArguments.split(' ');
      }
      return { command, commandArguments, argsArray };
    }
    throw new Error('Client is not a user');
  }

  private processNormal(message: Message): void {
    const { command, commandArguments, argsArray } = this.getCommandArguments(message);
    if (this.commandsMap.has(command)) {
      LoggingClient.log(`${command} command requested`, null, 'console');
      this.commandsMap.get(command)?.exec(message, commandArguments, argsArray);
    } else {
      message.channel.send(Responses.getResponse(Responses.NOT_A_COMMAND));
    }
  }

  private processDm(message: Message): void {
    const { command, commandArguments, argsArray } = this.getCommandArguments(message);
    if (this.commandsMap.has(command) && this.commandsMap.get(command)?.sendDm) {
      LoggingClient.log(`${command} command requested`, null, 'console');
      this.commandsMap.get(command)?.exec(message, commandArguments, argsArray);
    } else {
      message.channel.send(Responses.getResponse(Responses.NOT_A_COMMAND));
    }
  }
}
