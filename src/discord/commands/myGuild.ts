/*
 * KodeBlox Copyright 2017 Sayak Mukhopadhyay
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http: //www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Message } from 'discord.js';
import { Command } from '../command';
import { Responses } from '../responseDict';
import { Access } from '../../access';
import { GuildModel, IGuildSchema } from '../../db/schemas/guild';
import { LoggingClient } from '../../logging';
import { FORBIDDEN } from '../../access/accesses/forbidden';
import { ADMIN } from '../../access/accesses/admin';

export class MyGuild implements Command {
  respondDm = false;
  sendDm = false;
  respondAsDm: boolean;
  calls = ['myguild', 'mgd'];
  dmCalls = [];
  arguments = {
    set: this.set.bind(this),
    s: this.set.bind(this),
    remove: this.remove.bind(this),
    r: this.remove.bind(this)
  };

  constructor() {
    this.respondAsDm = false;
  }

  exec(message: Message, _commandArguments: string, argsArray: string[]): void {
    if (argsArray.length <= 0) {
      message.channel.send(Responses.getResponse(Responses.NO_PARAMS));
      return;
    }
    type ArgumentKeys = keyof typeof this.arguments;
    const allowedArguments = Object.keys(this.arguments) as Array<ArgumentKeys>;
    const command = argsArray[0].toLowerCase() as ArgumentKeys;
    if (!allowedArguments.includes(command)) {
      message.channel.send(Responses.getResponse(Responses.NOT_A_COMMAND));
      return;
    }
    this.arguments[command](message, argsArray);
  }

  async set(message: Message, argsArray: string[]): Promise<void> {
    // Only the server admins can set the guild
    const permission = await Access.has(message.author, message.guild, [], true);
    if (!permission) {
      message.channel.send(Responses.getResponse(Responses.INSUFFICIENT_PERMS));
      return;
    }
    if (argsArray.length > 1) {
      message.channel.send(Responses.getResponse(Responses.TOO_MANY_PARAMS));
      return;
    }
    const guildId = message.guildId;
    if (!guildId || !message.guild) {
      message.channel.send(Responses.getResponse(Responses.NOT_A_GUILD));
      return;
    }
    let guild: IGuildSchema | null;
    try {
      guild = await GuildModel.findOne({ guild_id: guildId });
    } catch (err) {
      message.channel.send(Responses.getResponse(Responses.FAIL));
      LoggingClient.error(err);
      return;
    }
    if (guild) {
      await message.channel.send(Responses.getResponse(Responses.FAIL));
      message.channel.send('Your guild is already set');
      return;
    }
    try {
      const newGuild = new GuildModel({
        guild_id: guildId,
        updated_at: new Date()
      });
      await newGuild.save();
      message.channel.send(Responses.getResponse(Responses.SUCCESS));
    } catch (err) {
      message.channel.send(Responses.getResponse(Responses.FAIL));
      LoggingClient.error(err);
      return;
    }
  }

  async remove(message: Message, argsArray: string[]): Promise<void> {
    const permission = await Access.has(message.author, message.guild, [ADMIN, FORBIDDEN], true);
    if (!permission) {
      message.channel.send(Responses.getResponse(Responses.INSUFFICIENT_PERMS));
      return;
    }
    if (argsArray.length > 1) {
      message.channel.send(Responses.getResponse(Responses.TOO_MANY_PARAMS));
      return;
    }
    const guildId = message.guildId;
    if (!guildId || !message.guild) {
      message.channel.send(Responses.getResponse(Responses.NOT_A_GUILD));
      return;
    }
    let guild: IGuildSchema | null;
    try {
      guild = await GuildModel.findOneAndRemove({ guild_id: guildId });
    } catch (err) {
      message.channel.send(Responses.getResponse(Responses.FAIL));
      LoggingClient.error(err);
      return;
    }
    if (!guild) {
      message.channel.send(Responses.getResponse(Responses.GUILD_NOT_SETUP));
      return;
    }
    message.channel.send(Responses.getResponse(Responses.SUCCESS));
  }

  help(): [string, string, string, string[]] {
    return [
      'myguild(aliases: mgd)',
      'Sets or removes your guild from BGSBot. Setting your guild is necessary for the bot to function',
      'myguild <set|remove>\nmyguild <s|r>',
      [
        '`@BGSBot myguild set`',
        '`@BGSBot mgd s`',
        '`@BGSBot myguild remove`',
        '`@BGSBot mgd remove`',
        '`@BGSBot myguild r`'
      ]
    ];
  }
}
