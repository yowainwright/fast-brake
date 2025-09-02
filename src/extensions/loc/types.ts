export interface Position {
  line: number;
  column: number;
}

export interface LOCInfo {
  start: Position;
  end: Position;
  offset: number;
  length: number;
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
    loc: LOCInfo;
    [key: string]: any;
  };
  rule: string;
  index?: number;
}
