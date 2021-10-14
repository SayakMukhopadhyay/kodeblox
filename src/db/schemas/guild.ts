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

import { Document, model, Schema } from 'mongoose';

export interface Guild {
  guild_id: string;
  admin_roles_id: string[];
  forbidden_roles_id: string[];
  created_at: Date;
  updated_at: Date;
}

export interface IGuildSchema extends Document, Guild {}

export const GuildSchema = new Schema<IGuildSchema>(
  {
    guild_id: {
      type: String,
      unique: true
    },
    admin_roles_id: [String],
    forbidden_roles_id: [String]
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
);

export const GuildModel = model('Guild', GuildSchema, 'guilds');
