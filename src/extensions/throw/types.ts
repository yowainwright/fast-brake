export interface ThrowInfo {
  type: string;
  errorType?: string;
  message?: string;
  isAsync?: boolean;
  isCaught?: boolean;
}

export interface DetectMatch {
  name: string;
  match: string;
  spec: any;
  rule: string;
  index?: number;
}

export interface ExtensionInput {
  code: string;
  result: DetectMatch;
}

export interface ExtensionOutput {
  name: string;
  match: string;
  spec: {
    throw: ThrowInfo;
    [key: string]: any;
  };
  rule: string;
  index?: number;
}
