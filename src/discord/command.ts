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

import { Message } from 'discord.js';

export interface Command {
  respondDm: boolean; // Should the bot respond to commands made in a DM
  sendDm: boolean; // Should the bot be able to respond with a DM
  respondAsDm: boolean; // instance level flag to determine whether to respond with a DM
  calls: string[]; // array to store the commands
  dmCalls: string[]; // array to store the commands which would respond with a DM
  arguments: Arguments;

  exec(message: Message, commandArguments: string, argsArray: string[]): void;
  help(): [string, string, string, string[]];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NewCommand = { new (...args: any[]): Command };
export type Arguments = Record<string, CallableFunction>;
