/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * Sent from the project to the proxy, with configuration and a port for further
 * messages.
 */
export const CONFIGURE_PROXY = 1;

/**
 * Sent from the proxy to the service worker, with a port that will be connected
 * to the project.
 */
export const CONNECT_SW_TO_PROJECT = 2;

/**
 * Sent from the proxy to the project, with a port that will be connected to the
 * service worker.
 */
export const CONNECT_PROJECT_TO_SW = 3;

/**
 * Sent from the service worker to the project, to confirm that the port was
 * received.
 */
export const ACKNOWLEDGE_SW_CONNECTION = 4;

/**
 * Sent from the service worker to the proxy, to notify when a file API is
 * missing and hence a re-connection is probably required.
 */
export const MISSING_FILE_API = 5;

export type PlaygroundMessage =
  | {
      type: typeof CONFIGURE_PROXY;
      url: string;
      scope: string;
      port: MessagePort;
    }
  | {
      type: typeof CONNECT_SW_TO_PROJECT;
      port: MessagePort;
    }
  | {
      type: typeof CONNECT_PROJECT_TO_SW;
      port: MessagePort;
    }
  | {
      type: typeof ACKNOWLEDGE_SW_CONNECTION;
    }
  | {
      type: typeof MISSING_FILE_API;
    };

export interface ServiceWorkerAPI {
  setFileAPI(fileAPI: FileAPI, sessionID: string): void;
}

export interface TypeScriptWorkerAPI {
  compileProject(
    files: Array<SampleFile>,
    importMap: ModuleImportMap
  ): Promise<Map<string, string>>;
}

export interface FileAPI {
  getFile(name: string): Promise<SampleFile | undefined>;
}

export interface SampleFile {
  /** Filename. */
  name: string;
  /** Optional display label. */
  label?: string;
  /** File contents. */
  content: string;
  /** MIME type. */
  contentType?: string;
}

export interface FileOptions {
  /** Optional file content. If omitted, files are fetched by name. */
  content?: string;
  /**
   * Optional content MIME type. If omitted, type is taken from fetch
   * Content-Type header if available, otherwise inferred from filename.
   */
  contentType?: string;
  /** Optional display label. */
  label?: string;
}

export interface ProjectManifest {
  files?: {[filename: string]: FileOptions};
  importMap?: ModuleImportMap;
}

export interface ModuleImportMap {
  imports?: {[name: string]: string};
  // No scopes for now.
}
