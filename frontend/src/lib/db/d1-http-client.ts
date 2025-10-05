// D1 HTTP API client for development
// Uses Cloudflare API to execute queries against remote D1 database

class D1PreparedStatement {
  private params: any[] = [];

  constructor(
    private client: D1HttpDatabase,
    private sql: string
  ) {}

  bind(...params: any[]) {
    this.params = params;
    return this;
  }

  async all() {
    const result = await this.client.execute(this.sql, this.params);
    console.log('📤 D1PreparedStatement.all() returning:', {
      hasResults: !!result.results,
      resultsLength: result.results?.length,
      firstResultKeys: result.results?.[0] ? Object.keys(result.results[0]) : [],
      sampleData: result.results?.[0]
    });
    // Drizzle expects { results: Row[] } format
    return {
      results: result.results || [],
      success: result.success,
      meta: result.meta
    };
  }

  async run() {
    const result = await this.client.execute(this.sql, this.params);
    console.log('📤 D1PreparedStatement.run() returning:', {
      hasResults: !!result.results,
      resultsLength: result.results?.length,
      firstResult: result.results?.[0]
    });
    // Drizzle expects { results: Row[] } format
    return {
      results: result.results || [],
      success: result.success,
      meta: result.meta
    };
  }

  async first(colName?: string) {
    const result = await this.client.execute(this.sql, this.params);
    const firstRow = result.results?.[0] || null;
    
    if (colName && firstRow) {
      return firstRow[colName];
    }
    
    // Ensure we return the actual row data, not wrapped
    return firstRow;
  }

  async raw() {
    const result = await this.client.execute(this.sql, this.params);
    console.log('📤 D1PreparedStatement.raw() returning rows:', result.results?.length);
    return result.results || [];
  }
}

export class D1HttpDatabase {
  constructor(
    private accountId: string,
    private databaseId: string,
    private apiToken: string
  ) {}

  prepare(sql: string) {
    console.log('🔧 D1HttpDatabase.prepare() called with SQL:', sql.substring(0, 100));
    const stmt = new D1PreparedStatement(this, sql);
    console.log('🔧 Prepared statement methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(stmt)));
    return stmt;
  }

  async execute(sql: string, params: any[] = []) {
    const url = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/d1/database/${this.databaseId}/query`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sql,
        params,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('D1 HTTP API Error:', error);
      throw new Error(`D1 query failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      console.error('D1 API returned error:', data.errors);
      throw new Error(data.errors?.[0]?.message || 'D1 query failed');
    }
    
    const result = data.result[0];
    
    return result;
  }

  async batch(statements: any[]) {
    // Batch execution not implemented for HTTP API
    // Execute sequentially
    const results = [];
    for (const stmt of statements) {
      results.push(await this.execute(stmt.sql, stmt.params || []));
    }
    return results;
  }

  async dump() {
    throw new Error('dump() not supported via HTTP API');
  }

  async exec(sql: string) {
    return this.execute(sql, []);
  }
}
