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

import { Guild, User } from 'discord.js';
import { IAccess } from './access';

export class Access {
  public static accessCheckers: IAccess[] = [];

  public static registerAccessChecker(accessChecker: IAccess): void {
    Access.accessCheckers.push(accessChecker);
    Access.accessCheckers.sort((a, b) => a.priority - b.priority);
  }

  public static async has(author: User, guild: Guild | null, perms: string[], allowAdmin = false): Promise<boolean> {
    let accessGranted = false;
    if (!guild) {
      return false;
    }

    for (const accessChecker of this.accessCheckers) {
      accessGranted = await accessChecker.has(author, guild, perms, allowAdmin);
    }
    return accessGranted;
  }
}
