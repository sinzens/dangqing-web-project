import mysql from 'mysql2'

export default class Server {
  private config: mysql.ConnectionOptions
  private connection!: mysql.Connection
  private connected = false

  public constructor (config_: mysql.ConnectionOptions) {
    const config = Object.assign({}, config_)
    config.multipleStatements = true
    this.config = config
  }

  public connect (
    callback?: ((err: mysql.QueryError | null) => void)
  ) {
    this.connection = mysql.createConnection(this.config)
    this.connection.connect(error => {
      if (!error) { this.connected = true }
      if (callback) { callback(error) }
    })
  }

  public disconnect (
    callback?: ((err: mysql.QueryError | null) => void)
  ) {
    if (this.isConnected()) {
      this.connection.end(error => {
        if (!error) { this.connected = false }
        if (callback) {
          callback(error)
        }
      })
    }
  }

  public query(
    sql: string,
    callback?: ((
      err: mysql.QueryError | null,
      results: any,
      field: mysql.FieldPacket[] | undefined
    ) => void) | undefined
  ) {
    if (this.isConnected()) {
      this.connection.query(sql, (error, results, field) => {
        if (callback) {
          callback(error, results, field)
        }
      })
    }
  }

  public queryAndWait(sql: string) {
    return new Promise(resolve => {
      if (this.isConnected()) {
        this.connection.query(sql, (error, results, field) => {
          resolve({ error, results, field })
        })
      }
    })
  }

  public isConnected () {
    return this.connected
  }
}
