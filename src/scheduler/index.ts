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

import { Agenda, Processor } from 'agenda';
import { Connection } from 'mongoose';

export type SchedulerOptions = {
  collectionName: string;
  scheduleName: string;
  callback: Processor;
};

export class Scheduler {
  public schedule: Agenda;

  constructor(connection: Connection, schedulerCollectionName: string, scheduleName: string, cb: Processor) {
    this.schedule = new Agenda({ mongo: connection.db, db: { address: '', collection: schedulerCollectionName } });
    this.schedule.define(scheduleName, cb);
  }

  public createJob(cron: string, name: string, data: unknown): Promise<unknown> {
    return this.schedule.every(cron, name, data);
  }

  public deleteJob(name: string): void {
    this.schedule.cancel({ name });
  }

  public updateJob(name: string): void {
    console.log(name);
  }
}
