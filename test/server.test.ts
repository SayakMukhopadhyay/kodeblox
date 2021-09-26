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

import { AppServer } from '../src/server';

describe('server', () => {
  it('starts with defaults', async () => {
    const appServer = new AppServer();
    try {
      const listeningCallbackPromise = new Promise((resolve, reject) => {
        appServer.server.on('listening', resolve);
        appServer.server.on('error', reject);
      });
      await expect(listeningCallbackPromise).resolves.toBe(undefined);
    } finally {
      appServer?.server.close();
    }
  });

  it('uses default port', async () => {
    const appServer = new AppServer();
    try {
      expect(appServer.port).toEqual(8080);
    } finally {
      appServer?.server.close();
    }
  });
});
