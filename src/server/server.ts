import mysql from 'mysql'

export default class Server {
  private config: mysql.ConnectionConfig
  private connection!: mysql.Connection

  public constructor (config_: mysql.ConnectionConfig) {
    const config = Object.assign({}, config_)
    config.multipleStatements = true
    this.config = config
  }

  public connect (
    callback?: ((err: mysql.MysqlError, ...args: any[]) => void) |
    undefined
  ) {
    this.connection = mysql.createConnection(this.config)
    this.connection.connect(callback)
  }

  public disconnect () {
    this.connection.end()
  }

  public query(
    sql: string,
    callback?: ((
      err: mysql.MysqlError | null,
      results: any,
      field: mysql.FieldInfo[] | undefined
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
    return (
      this.connection.state === 'connected' ||
      this.connection.state === 'authenticated'
    )
  }
}
