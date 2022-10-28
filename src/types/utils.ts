export interface IHTMLJson {
  node?: string;
  tag?: string;
  text?: string | undefined;
  child?: IHTMLJson[];
}

export interface IHTMLObject {
  value?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  lineThrough?: boolean;
  linebreak?: boolean;
}
