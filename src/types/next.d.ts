declare module 'next' {
  export interface NextApiRequest {
    query: {
      [key: string]: string | string[];
    };
    body: any;
    headers: {
      [key: string]: string | string[] | undefined;
      authorization?: string;
    };
    method?: string;
  }

  export interface NextApiResponse {
    status(code: number): NextApiResponse;
    json(data: any): void;
    end(): void;
  }
}