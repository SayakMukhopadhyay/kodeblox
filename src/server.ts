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

import { Application } from 'express';
import express from 'express';
import morgan from 'morgan';
import http from 'http';
import { Server } from 'http';
import { AddressInfo } from 'net';
import { LoggingClient } from './logging';
import { DiscordClient, DiscordOptions } from './discord';

export class AppServer {
  get server(): Server {
    return this._server;
  }
  public express: Application;
  public port: number;
  public discordClient: DiscordClient;
  private readonly _server: Server;

  constructor(options: Options) {
    this.express = express();
    this.port = options?.port || 8080;

    if (options?.preMiddlewareHook) {
      options.preMiddlewareHook();
    }
    this.middleware(options);
    if (options?.postMiddlewareHook) {
      options.postMiddlewareHook();
    }
    this.discordClient = new DiscordClient(options.discord);

    this.express.set('port', this.port);
    this._server = http.createServer(this.express);
    this._server.listen(this.port);
    this._server.on('error', this.onError.bind(this));
    this._server.on('listening', this.onListening.bind(this));
  }

  private middleware(options: Options): void {
    if (!options?.disableRouteLogs) {
      this.express.use(morgan('dev'));
    }
  }

  private onError(error: NodeJS.ErrnoException): void {
    if (error.syscall !== 'listen') throw error;
    switch (error.code) {
      case 'EADDRINUSE':
        LoggingClient.error(`Port ${this.port} is already in use`, null, 'console');
        process.exit(1);
        break;
      default:
        throw error;
    }
  }

  private onListening(): void {
    const address = this._server.address() as AddressInfo;
    if (address) {
      LoggingClient.log(`Listening on port ${address.port}`, null, 'console');
    }
  }
}

export type Options = {
  port?: number;
  preMiddlewareHook?: () => void;
  postMiddlewareHook?: () => void;
  discord: DiscordOptions;
  disableRouteLogs?: boolean;
};
